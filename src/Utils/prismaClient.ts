import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "./Logger";

const prismaClients: Record<string, PrismaClient> = {};

export function getTenantClient(schema: string): PrismaClient {
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