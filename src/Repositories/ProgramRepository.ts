import { Prisma, PrismaClient, ProgramLevel } from "@prisma/client";
import { logger } from "../Utils/Logger";

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
    logger.info({
      info: programData
    });
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

  static async GetProgramById(id: number, prisma: DbClient)  {
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

  public static async ProgramExists(
    programId: number,
    prisma: PrismaClient | Prisma.TransactionClient
  ): Promise<boolean> {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { id: true }
    });
    return program !== null;
  }

  public static async GetProgramLevelById(
    programLevelId: number,
    prisma: PrismaClient | Prisma.TransactionClient,
    selectColumns?: Array<keyof Prisma.ProgramLevelSelect>
  ): Promise<Partial<ProgramLevel> | null> {
    const select: Prisma.ProgramLevelSelect = {};

    if (selectColumns && selectColumns.length > 0) {
      selectColumns.forEach((col) => {
        select[col] = true;
      });
    } else {
      select.id = true;
      select.programId = true;
    }
    return prisma.programLevel.findUnique({
      where: { id: programLevelId },
      select,
    });
  }

  public static async IsProgramLevelBelongsToProgram(
    programLevelId: number,
    programId: number,
    prisma: PrismaClient
  ): Promise<boolean> {
    const programLevel = await prisma.programLevel.findUnique({
      where: {
        id_programId: {
          id:        programLevelId,
          programId: programId,
        },
      },
      select: { id: true },
    });

    return programLevel !== null;
  }
  static async GetProgramsByFacultyId(facultyId:number, prisma: PrismaClient){
   return await prisma.program.findMany({where:{facultyId:facultyId}});
  
  }
}
