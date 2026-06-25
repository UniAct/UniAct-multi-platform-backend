import { GetTenantClient } from "../Utils/prismaClient";

(async () => {
  const prisma = GetTenantClient("anu");
  try {
    const transcripts = await prisma.transcript.findMany({
      where: { semesterId: 12 },
      select: { id: true, studentId: true, semesterId: true, semesterGpa: true, cumulativeGpa: true },
    });
    console.log(`Found ${transcripts.length} transcripts for semester 12:`);
    transcripts.forEach((t) => {
      console.log(
        `  Student ${t.studentId}: semesterGPA=${t.semesterGpa}, cumulativeGPA=${t.cumulativeGpa}`
      );
    });
  } catch (e: any) {
    console.error("ERR", e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
