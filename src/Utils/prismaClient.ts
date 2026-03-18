import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "./Logger";

const prismaClients: Record<string, PrismaClient> = {};
let shutdownHooksRegistered = false;

async function disconnectAllTenantClients(): Promise<void> {
  const disconnectTasks = Object.values(prismaClients).map((client) =>
    client.$disconnect().catch((error) => {
      console.error("[WARN] Failed disconnecting Prisma client", error);
    })
  );

  await Promise.all(disconnectTasks);
}

export function setupTenantClientShutdownHooks(): void {
  if (shutdownHooksRegistered) return;
  shutdownHooksRegistered = true;

  const shutdown = async (signal?: string) => {
    if (signal) {
      console.log(`[INFO] Received ${signal}. Closing Prisma clients...`);
    }

    await disconnectAllTenantClients();
  };

  process.once("beforeExit", async () => {
    await shutdown();
  });

  process.once("SIGINT", async () => {
    await shutdown("SIGINT");
    process.exit(0);
  });

  process.once("SIGTERM", async () => {
    await shutdown("SIGTERM");
    process.exit(0);
  });
}

export function getTenantClient(schema: string): PrismaClient {
  setupTenantClientShutdownHooks();
  if (!prismaClients[schema]) {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
      logger.error({ action: "getTenantClient", schema, message: "DATABASE_URL not set" });
      throw new Error("DATABASE_URL must be set");
    }

    // Append schema parameter
    const url = new URL(baseUrl);
    url.searchParams.set("schema", schema);

    // Create the adapter with the connection string
    const adapter = new PrismaPg(
      { connectionString: url.toString() },
      { schema }
    );

    prismaClients[schema] = new PrismaClient({
      adapter,
      log: ["error"],
    });

    logger.info({ action: "getTenantClient", schema, status: "session created" });
  } else {
    logger.info({ action: "getTenantClient", schema, status: "session reused" });
  }

  return prismaClients[schema];
}
