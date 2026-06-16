import { GetTenantClient } from "../Utils/prismaClient";

(async () => {
  const prisma = GetTenantClient("anu");
  try {
    const rows = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='anu' ORDER BY table_name`;
    console.log(JSON.stringify(rows, null, 2));
  } catch (e: any) {
    console.error("ERR", e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
