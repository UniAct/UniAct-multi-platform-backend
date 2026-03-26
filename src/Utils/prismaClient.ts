import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "./Logger";

const prismaClients: Record<string, PrismaClient> = {};

export function GetTenantClient(schema: string): PrismaClient {
  setupTenantClientShutdownHooks();
  if (!prismaClients[schema]) {
    const baseUrl = process.env.DATABASE_URL;
    
    if (!baseUrl) {
      logger.error({ action: "GetTenantClient", schema, message: "DATABASE_URL not set" });
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

    logger.info({ action: "GetTenantClient", schema, status: "session created" });
  } else {
    logger.info({ action: "GetTenantClient", schema, status: "session reused" });
  }

  return prismaClients[schema];
}


// this function will be used to clear all connected pool or clients when we shutdown the server to prevent any unused Zombie connections to the DB

export async function disconnectAllTenantClients(): Promise<void> {
  const disconnectTasks = Object.values(prismaClients).map((client) =>
    client.$disconnect().catch((error) => {
      console.error("[WARN] Failed disconnecting Prisma client", error);
    })
  );

  await Promise.all(disconnectTasks);
}

