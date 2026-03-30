import { disconnectAllTenantClients } from "./prismaClient";
import { logger } from "./Logger";
import { Server } from "http";

export function GracefulShutdown(server: Server) {
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.warn({
      action: "Shutdown",
      status: `Graceful shutdown started (${signal})`,
    });

    try {
      // 1. Stop accepting new requests
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      logger.info({ action: "Shutdown", status: "HTTP server closed" });

      

      // 3. Disconnect Prisma clients
      await disconnectAllTenantClients();
      logger.info({ action: "Shutdown", status: "Prisma disconnected" });

      logger.info({ action: "Shutdown", status: "Graceful shutdown complete" });

      process.exit(0);
    } catch (error) {
      logger.error({ action: "Shutdown", error });
      process.exit(1);
    }
  };

  process.once("SIGINT", () =>{shutdown("SIGINT")});
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}