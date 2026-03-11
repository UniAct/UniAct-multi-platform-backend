import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClients: Record<string, PrismaClient> = {};

export function getTenantClient(schema: string): PrismaClient {
  if (!prismaClients[schema]) {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
      throw new Error("DATABASE_URL must be set");
    }

    // Append schema parameter
    const url = new URL(baseUrl);
    url.searchParams.set("schema", schema);

    // Create the adapter with the connection string
    const adapter = new PrismaPg({connectionString: url.toString(),});
    
    prismaClients[schema] = new PrismaClient({
      adapter,
      log: ["error"],
    });
  }

  return prismaClients[schema];
}