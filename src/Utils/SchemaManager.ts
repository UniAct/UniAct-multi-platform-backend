import { getTenantClient } from "./prismaClient";

export class SchemaManager {

  static async createSchema(schema: string) {

    const prisma = getTenantClient("public");

    try {

      await prisma.$executeRawUnsafe(
        `SELECT clone_schema('template', '${schema}')`
      );

      console.log(`[INFO] Tenant schema ${schema} created from template`);

    } catch (error) {

      console.error(`[ERROR] Failed creating schema ${schema}`, error);
      throw error;

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