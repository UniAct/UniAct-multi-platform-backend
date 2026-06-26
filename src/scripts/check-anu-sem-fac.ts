import { GetTenantClient } from "../Utils/prismaClient";

(async () => {
  const prisma = GetTenantClient("anu");
  try {
    const faculty = await prisma.faculty.findUnique({ where: { id: 4 } });
    console.log('FACULTY:', JSON.stringify(faculty, null, 2));
    const semester = await prisma.semester.findUnique({ where: { id: 12 } });
    console.log('SEMESTER:', JSON.stringify(semester, null, 2));
  } catch (e: any) {
    console.error('ERR', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
