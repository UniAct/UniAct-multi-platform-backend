import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { RedisSubscriber } from "../../Utils/RedisPubSub";
import { logger } from "../../Utils/Logger";
import { Channels } from "../../Enums/Channels";
import { Authenticate, CleanupClient, Send } from "./Helpers";
import { ClientMeta, SeatUpdatePayload } from "./types";
import { subscribeSchema } from "./validator";
import z from "zod";

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────

export const clients = new Map<WebSocket, ClientMeta>();

// slotId → set of sockets that are interests on that schedule slot id 
export const slotSubscriptions = new Map<number, Set<WebSocket>>();

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
]);

const MAX_BUFFER = 1_000_000; // 1MB
const RATE_LIMIT = 20; // messages per window
const RATE_WINDOW = 10_000; // 10 sec

// ─────────────────────────────────────────────
// Server
// ─────────────────────────────────────────────

export async function StartEnrollmentWebSocketServer(port: number) {
  const wss = new WebSocketServer({
    port,
    // verifyClient: ({ req }: { req: IncomingMessage }) => {
    //   const origin = req.headers.origin;

    //   if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    //     logger.warn({ message: "WS connection rejected — unauthorized origin", origin });
    //     return false;
    //   }

    //   return true;
    // }
  });

  // ─── Redis ─────────────────────────────
  // Think of Redis as the central “announcement system” for seat changes.
  //
  // Somewhere else in the system (your workers / services), whenever a seat changes,
  // they don’t talk to WebSocket clients directly — they just shout into Redis:
  //
  //   "Hey! Slot 42 now has 3 seats left!"
  //
  // This server is constantly listening to that channel.
  // It’s like sitting next to a speaker, waiting for announcements.
  //
  // Once we hear something:
  // 1) First, make sure the message is actually valid JSON (because Redis doesn’t guarantee that).
  //    If it’s garbage → ignore it, don’t let it crash us.
  //
  // 2) Extract the slotId from the message.
  //
  // 3) Now ask:
  //    "Who actually cares about this slot?"
  //    → Look into our in-memory index (slotSubscriptions)
  //
  //    If nobody is subscribed → do nothing (no wasted work).
  //
  // 4) If there *are* interested clients:
  //    Loop through them and try to deliver the update.
  //
  //    But before sending:
  //    - If the connection is already closed → skip it
  //    - If the client is too slow (buffer is full) → kill it
  //      (otherwise one slow client can crash the whole server)
  //
  // 5) Finally, send the update only to the relevant clients.
  //    No broadcasting. No noise. Just targeted delivery.
  //
  // In short:
  // Redis tells us "something changed",
  // and we efficiently forward that change only to the people who asked for it.
  await RedisSubscriber.subscribe(Channels.StudentEnrollment);

  RedisSubscriber.on("message", (channel, message) => {
    if (channel !== Channels.StudentEnrollment) return;

    let payload: SeatUpdatePayload;

    try {
      payload = JSON.parse(message);
    } catch {
      logger.warn({ message: "Invalid Redis payload", raw: message });
      return;
    }

    const targets = slotSubscriptions.get(payload.slotId);
    if (!targets) return;

    for (const ws of targets) {
      // in case of connection closed for that interested client -->  continue
      if (ws.readyState !== WebSocket.OPEN) continue;

      if (ws.bufferedAmount > MAX_BUFFER) {
        ws.terminate();
        CleanupClient(ws);
        continue;
      }

      Send(
        ws , 
        {
          type: "seat_update",
          slotId: payload.slotId,
          remainingSeats: payload.remainingSeats
        }
      );
    }
  });

  logger.info({ message: "Subscribed to Redis channel" });

  // ─── Heartbeat ─────────────────────────
  // WebSockets don’t automatically tell you when a client quietly dies.
  //
  // A user might:
  // - close their laptop
  // - lose internet
  // - kill the browser tab
  //
  // From the server’s perspective, the connection can still look “alive” forever.
  // That’s dangerous — dead connections pile up and slowly kill your server.
  //
  // So we play a simple game every 30 seconds:
  //
  // 1) We go through every connected client and ask:
  //    "Are you still there?"
  //
  // 2) But instead of asking directly, we send a low-level `ping`.
  //
  // 3) A healthy client will automatically respond with a `pong`
  //    (handled elsewhere in ws.on("pong")).
  //
  // 4) Here’s the trick:
  //    - Before sending the ping, we mark the client as `isAlive = false`
  //    - If we later receive a `pong`, we flip it back to `true`
  //
  // 5) On the *next* interval:
  //    - If a client is STILL `isAlive = false`,
  //      that means they never responded → they’re gone.
  //
  //    → We terminate the connection and clean it up.
  //
  // This creates a simple heartbeat loop:
  //    ping → pong → alive
  //    ping → (no response) → dead → terminate
  //
  // Important detail:
  // We use `continue` instead of `return` so one dead client
  // doesn’t stop the entire cleanup loop.
  //
  // In short:
  // We regularly “tap” each client,
  // and if they don’t tap back — we let them go.
  const interval = setInterval(() => {
    for (const [ws, meta] of clients) {
      if (!meta.isAlive) {
        ws.terminate();
        CleanupClient(ws);
        continue; 
      }

      meta.isAlive = false;
      ws.ping();
    }
  }, 30_000);

  // When the server itself shuts down,
  // stop the heartbeat loop to avoid leaks.
  wss.on("close", () => clearInterval(interval));

  // ─── Connection ────────────────────────
  // A new client just connected.
  // Think of this moment like someone walking into a control room
  // and asking to receive live updates.

  // First question we ask:
  // "Who are you?"
  // If they can’t prove their identity → we don’t even let them in.
  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const userId = Authenticate(req);

    if (!userId) {
      ws.send(JSON.stringify({
        type: "error",
        message: "Unauthorized"
      }));

      ws.close(1008, "Unauthorized");
      return;
    }

    // We grab their IP just for logging / observability.
    const clientIp = req.socket.remoteAddress;

    // Now we register this client in our system.
    // At this point:
    // - they are alive
    // - they are not subscribed to anything yet
    // - they have a clean rate limit state
    clients.set(
      ws, 
      {
        subscribedSlotIds: new Set(),
        isAlive: true,
        messageCount: 0,
        lastMessageReset: Date.now(),
        userId,
      } as ClientMeta
    );

    logger.info({ message: "Client connected", clientIp });

    // ─── Pong ─────────────────────────
    // This is the other half of the heartbeat system.
    //
    // Earlier, we send "ping".
    // If the client is healthy, they respond with "pong".
    //
    // When we receive that pong:
    // → we mark them as alive again.
    //
    // If they stop responding, the heartbeat loop will eventually kill them.
    ws.on("pong", () => {
      const meta = clients.get(ws);
      if (meta) meta.isAlive = true;
    });

    // ─── Message ──────────────────────
    // This is where the client talks to us.
    // In our system, the client mainly sends:
    // → "Here are the slotIds I care about"
    //
    // But we don’t trust anything blindly.
    ws.on("message", (data) => {
      const meta = clients.get(ws);
      if (!meta) return;

      const now = Date.now();

      // ── Step 1: Rate limiting ──
      // Every client gets a small quota of messages per time window.
      //
      // Why?
      // Because a buggy or malicious client could spam us
      // and overload the server.
      //
      // So we:
      // - reset the counter every window
      // - increment on each message
      // - kill the connection if they exceed the limit
      if (now - meta.lastMessageReset > RATE_WINDOW) {
        meta.messageCount = 0;
        meta.lastMessageReset = now;
      }

      meta.messageCount++;
      if (meta.messageCount > RATE_LIMIT) {
        ws.terminate();
        CleanupClient(ws);
        return;
      }

      // ── Step 2: Parse the message ──
      // We expect JSON. Anything else is rejected immediately.
      let parsed;
      try {
        parsed = JSON.parse(data.toString());
      } catch {
        Send(ws, { type: "error", message: "Invalid JSON" });
        return;
      }

      // ── Step 3: Validate the structure ──
      // Even if it's valid JSON, it still might be garbage.
      // So we run it through our schema (Zod).
      const result = subscribeSchema.safeParse(parsed);
      if (!result.success) {
        Send(ws, {
          type: "error",
          message: "Invalid payload",
          errors: z.flattenError(result.error).fieldErrors,
        });
        return;
      }

      // At this point:
      // We trust the data. It’s clean and safe.
      const newSlots = new Set(result.data.slotIds);

      // ── Step 4: Sync subscriptions ──
      // The client sends the FULL list of slots they care about.
      //
      // So we don’t "add/remove blindly".
      // Instead, we compare:
      //   old subscriptions vs new subscriptions

      // Remove slots the client no longer cares about
      for (const slotId of meta.subscribedSlotIds) {
        if (!newSlots.has(slotId)) {
          const set = slotSubscriptions.get(slotId);
          if (set) {
            set.delete(ws);
            if (set.size === 0) slotSubscriptions.delete(slotId);
          }
        }
      }

      // Add new subscriptions
      for (const slotId of newSlots) {
        if (!meta.subscribedSlotIds.has(slotId)) {
          if (!slotSubscriptions.has(slotId)) {
            slotSubscriptions.set(slotId, new Set());
          }
          slotSubscriptions.get(slotId)!.add(ws);
        }
      }

      // Finally, update the client’s state
      meta.subscribedSlotIds = newSlots;

      // ── Step 5: Acknowledge ──
      // We confirm back to the client what they are now subscribed to.
      // This keeps frontend and backend in sync.
      Send(ws, {
        type: "subscribed",
        slotIds: [...newSlots],
      });
    }
  );

  // ─── Close ────────────────────────
  ws.on("close", () => {
    CleanupClient(ws);
    logger.info({ message: "Client disconnected", clientIp });
  });

  ws.on("error", (err) => {
      logger.error({ message: "WS error", err });
      CleanupClient(ws);
    });
  });

  // ─── Graceful Shutdown ───────────────
  const shutdown = async () => {
    logger.info({ message: "Shutting down WS server..." });

    wss.close();
    clearInterval(interval);

    for (const ws of clients.keys()) {
      ws.terminate();
    }

    await RedisSubscriber.quit();

    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  logger.info({ message: "WebSocket server started", port });
}
