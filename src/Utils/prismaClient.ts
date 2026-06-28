import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "./Logger";

type TenantClientCache = Record<string, PrismaClient>;
const PUBLIC_SCHEMA = "public";
const TEMPLATE_SCHEMA = "template";

const globalForTenantPrisma = globalThis as typeof globalThis & {
  __tenantPrismaClients?: TenantClientCache;
};

const prismaClients: TenantClientCache =
  globalForTenantPrisma.__tenantPrismaClients ?? {};

if (!globalForTenantPrisma.__tenantPrismaClients) {
  globalForTenantPrisma.__tenantPrismaClients = prismaClients;
}

export function GetTenantClient(schema: string): PrismaClient {
  const normalizedSchema = schema.trim();

  if (!normalizedSchema) {
    logger.error({ action: "getTenantClient", schema, message: "schema must be provided" });
    throw new Error("schema must be provided");
  }

  if (prismaClients[normalizedSchema]) {
    logger.info({ action: "getTenantClient", schema: normalizedSchema, status: "session reused" });
    return prismaClients[normalizedSchema];
  }

  const baseUrl = process.env.DATABASE_URL;

  if (!baseUrl) {
    logger.error({ action: "getTenantClient", schema: normalizedSchema, message: "DATABASE_URL not set" });
    throw new Error("DATABASE_URL must be set");
  }

  // Append schema parameter
  const url = new URL(baseUrl);
  url.searchParams.set("schema", normalizedSchema);

  // Create the adapter with the connection string
  const adapter = new PrismaPg(
    { connectionString: url.toString() },
    { schema: normalizedSchema }
  );

  const clientOptions: any = {
    adapter,
    log: ["error"],
  };

  const tenantModelSchema =
    normalizedSchema === PUBLIC_SCHEMA ? TEMPLATE_SCHEMA : normalizedSchema;

  clientOptions.__internal = {
    configOverride(config: any) {
      const inlineSchema = String(config.inlineSchema ?? "")
        .replace(
          /schemas\s+=\s+\["public",\s*"[^"]+"\]/,
          `schemas  = ["public", "${tenantModelSchema}"]`
        )
        .replace(
          /@@schema\("(?!public")[^"]+"\)/g,
          `@@schema("${tenantModelSchema}")`
        );

      return { ...config, inlineSchema };
    },
  };

  const client = new PrismaClient(clientOptions);

  prismaClients[normalizedSchema] = client;
  logger.info({ action: "getTenantClient", schema: normalizedSchema, status: "session created" });

  return client;
}


// this function will be used to clear all connected pool or clients when we shutdown the server to prevent any unused Zombie connections to the DB

export async function disconnectAllTenantClients(): Promise<void> {
  const disconnectTasks = Object.values(prismaClients).map((client) =>
    client.$disconnect().catch((error) => {
      console.error("[WARN] Failed disconnecting Prisma client", error);
    })
  );

  await Promise.all(disconnectTasks);

  for (const key of Object.keys(prismaClients)) {
    delete prismaClients[key];
  }
}
