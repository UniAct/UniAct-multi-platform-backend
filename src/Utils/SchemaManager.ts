import { logger } from "./Logger";
import fs from "fs";
import { Pool } from "pg";
import path from "path";
import { getTenantClient } from "./prismaClient";
const MIGRATIONS_DIR = path.join(process.cwd(), "prisma/migrations");
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
    logger.info({ action: "createTenant", schema, status: "starting" });

    const client = await this.getPool().connect();

    try {
      await client.query("BEGIN");

      const sql = this.SNAPSHOT.replace(/__SCHEMA__/g, schema);
      await client.query(sql);

      //seed all migrations as already applied 
      const migrationFiles =getMigrationFiles();
      for (const file of migrationFiles) {
        console.log(file);
        await client.query(
          `INSERT INTO "${schema}".migrations (name) VALUES ($1) ON CONFLICT DO NOTHING`,
          [file]
        );
      }
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


function getMigrationFiles(): string[] {
  const folders = fs.readdirSync(MIGRATIONS_DIR);

  const files: string[] = [];

  for (const folder of folders) {
    const fullDir = path.join(MIGRATIONS_DIR, folder);
    if (fs.statSync(fullDir).isDirectory()) {
      const file = path.join(fullDir, "migration.sql");
      if (fs.existsSync(file)) {
        files.push(path.relative(MIGRATIONS_DIR,file));
      }
    }
  }

  return files.sort();
}