import { GetTenantClient } from "../Utils/prismaClient";
import { TranscriptRepository } from "../Repositories/TranscriptRepository";

const args = process.argv.slice(2);
const schema = args[0] || process.env.SCHEMA || 'public';
const semesterId = parseInt(args[1] || '1', 10);
const facultyId = parseInt(args[2] || '1', 10);

(async () => {
  try {
    const prisma = GetTenantClient(schema as string);
    const students = await TranscriptRepository.GetStudentIdsForSemesterAndFaculty(semesterId, facultyId, prisma as any);
    console.log(JSON.stringify({ schema, semesterId, facultyId, count: students.length, students }, null, 2));
    process.exit(0);
  } catch (err: any) {
    console.error('ERROR', err?.message ?? err);
    process.exit(1);
  }
})();
