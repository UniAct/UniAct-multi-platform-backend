import { IncomingMessage } from "http";
import { SubscribeMessage } from "./types";
import {WebSocket} from "ws";
import { clients, slotSubscriptions } from "./EnrollmentWebSocket";
import JwtService from "../../Utils/JwtService";
import { TokenPayload } from "../../Interfaces/TokenPayload";

export function Send(ws: WebSocket, payload: object) {
    ws.send(JSON.stringify(payload));
}

export function ParseSubscribeMessage(raw: string): SubscribeMessage | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed.type === "subscribe" &&
      Array.isArray(parsed.slotIds) &&
      parsed.slotIds.every((id: unknown) => typeof id === "number")
    ) {
      return parsed as SubscribeMessage;
    }
    return null;
  } catch {
    return null;
  }
}


export function Authenticate(req: IncomingMessage): number | null {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return null;

  try {
    const decoded = JwtService.Verify(token) as TokenPayload;
    return decoded.id!;
  } catch {
    return null;
  }
}

export function CleanupClient(ws: WebSocket) {
  const meta = clients.get(ws);
  if (!meta) return;

  for (const slotId of meta.subscribedSlotIds) {
    const set = slotSubscriptions.get(slotId);
    if (set) {
      set.delete(ws);
      if (set.size === 0) slotSubscriptions.delete(slotId);
    }
  }

  clients.delete(ws);
}