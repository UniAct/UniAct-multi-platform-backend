import { GetTenantClient } from "../Utils/prismaClient";

(async () => {
  try {
    const prisma = GetTenantClient("public");
    const rows = await prisma.$queryRawUnsafe(`
      select table_schema, table_name
      from information_schema.tables
      where table_schema = $1
      order by table_name
    `, "public");

    console.log(JSON.stringify(rows, null, 2));
  } catch (err: any) {
    console.error(err?.message || err);
    process.exit(1);
  } finally {
    try { await GetTenantClient("public").$disconnect(); } catch {};
  }
})();
