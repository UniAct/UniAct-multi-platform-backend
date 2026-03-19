import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class ProgramRepository {

   // To make controllers/services get a consistent program shape.
   // flow updated to relies on programLevels to clean dependent rows before rebuild.
   private static readonly programDetailsInclude = {
      faculty: true,
      head: { include: { user: true } },
      programLevels: { include: { fees: { include: { semester: true } } } },
      programTranscriptDefs: true,
      academicLoadSemesters: { include: { semester: true, programLevel: true } },
      academicLoadGPAs: true,
      programCourses: { include: { course: true } },
   } as const;

   static async CreateProgram(programData: Prisma.ProgramCreateInput, prisma: DbClient) {
      return await prisma.program.create({
         data: programData,
         include: this.programDetailsInclude,
      });
   }

   static async GetAllPrograms(prisma: DbClient) {
      return await prisma.program.findMany({
         include: this.programDetailsInclude,
         orderBy: [{ name: "asc" }],
      });
   }

   static async GetProgramById(id: number, prisma: DbClient) {
      return prisma.program.findUnique({
         where: { id },
         include: this.programDetailsInclude,
      });
   }

   static async UpdateProgram(id: number, programData: Prisma.ProgramUpdateInput, prisma: DbClient) {
      return prisma.program.update({
         where: { id },
         data: programData,
         include: this.programDetailsInclude,
      });
   }

   static async DeleteProgramById(id: number, prisma: DbClient) {
      await prisma.program.delete({ where: { id } });
   }
}
