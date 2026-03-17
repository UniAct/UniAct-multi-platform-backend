import { logger } from "./Logger";
import fs from "fs";
import { Pool } from "pg";
import { getTenantClient } from "./prismaClient";

export class SchemaManager {
  private static SNAPSHOT = fs.readFileSync("./prisma/template_snapshot.sql", "utf8");
  private static pool = new Pool({ connectionString: process.env.DATABASE_URL });

  static async createTenant(schema: string) {
    logger.info({ action: "createTenant", schema, status: "starting" });

    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const sql = this.SNAPSHOT.replace(/__SCHEMA__/g, schema);

      await client.query(sql);

      await client.query("COMMIT");

      logger.info({ action: "createTenant", schema, status: "success" });
    } catch (error) {
      await client.query("ROLLBACK");

      logger.error({ action: "createTenant", schema, status: "failed", err: error });
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteSchema(schema: string) {
    const prisma = getTenantClient("public");

    try {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);

      logger.info({ action: "deleteSchema", schema, status: "success" });
    } catch (error) {
      logger.error({ action: "deleteSchema", schema, status: "failed", err: error });
      throw error;
    }
  }
}