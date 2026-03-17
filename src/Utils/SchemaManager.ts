import fs from "fs";
import { Pool } from "pg";
import { getTenantClient } from "./prismaClient";

export class SchemaManager {

  private static SNAPSHOT = fs.readFileSync("./prisma/template_snapshot.sql", "utf8");

  private static pool: Pool | null = null;

  private static getPool(): Pool {
    if (!this.pool || (this.pool as any).ended) {
      this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    }

    return this.pool;
  }

  static async createTenant(schema: string) {

    console.log(`[INFO] Starting creation of tenant schema '${schema}'...`);

    const client = await this.getPool().connect();

    try {

      await client.query("BEGIN");


      // inject schema name
      const sql = this.SNAPSHOT.replace(/__SCHEMA__/g, schema);

      // execute the entire dump
      await client.query(sql);

      await client.query("COMMIT");

      console.log(`[SUCCESS] Tenant '${schema}' bootstrapped successfully.`);

    } catch (error) {

      await client.query("ROLLBACK");

      console.error(`[ERROR] Failed creating tenant '${schema}'`, error);

      throw error;

    } finally {

      client.release();

    }
  }

  static async deleteSchema(schema: string) {

    const prisma = getTenantClient("public");

    try {

      await prisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE`
      );

      console.log(`[INFO] Schema ${schema} deleted`);

    } catch (error) {

      console.error(`[ERROR] Failed deleting schema ${schema}`, error);
      throw error;

    }

  }

}
