import { Pool } from "pg";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class SchemaManager {
  constructor(private pool: Pool) {}

  async createSchema(schema: string) {
    const client = await this.pool.connect();

    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

      const url = `${process.env.DATABASE_URL}?schema=${schema}`;

      await execAsync(`npx prisma db push`, {
        env: {
          ...process.env,
          DATABASE_URL: url
        }
      });

      console.log(`Schema ${schema} ready`);
    } finally {
      client.release();
    }
  }

  async deleteSchema(schema: string) {
    const client = await this.pool.connect();

    try {
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    } finally {
      client.release();
    }
  }
}