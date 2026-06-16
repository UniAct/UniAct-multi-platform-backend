import { GetTenantClient } from "../Utils/prismaClient";

const args = process.argv.slice(2);
const tableNames = args.length ? args : ["CourseRegistration"];

(async () => {
  try {
    const prisma = GetTenantClient("public");
    for (const tableName of tableNames) {
      const rows: any[] = await prisma.$queryRawUnsafe(`
        select table_schema, table_name
        from information_schema.tables
        where table_name = $1
        order by table_schema
      `, tableName);
      console.log(`Table: ${tableName}`);
      console.log(JSON.stringify(rows, null, 2));
    }
    await prisma.$disconnect();
  } catch (err: any) {
    console.error('ERROR', err?.message ?? err);
    process.exit(1);
  }
})();
