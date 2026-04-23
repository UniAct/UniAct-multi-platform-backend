import { Prisma, PrismaClient, ProgramLevel } from "@prisma/client";
import { CreateProgramRequestDto } from "../Interfaces/Program/Create/CreateProgramSchema";

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

  static async CreateProgram(
    input: CreateProgramRequestDto,
    connection: PrismaClient
  ): Promise<{ programId: number }> {
    return await connection.$transaction(
      async (prisma : Prisma.TransactionClient) => {
      
        const program = await prisma.program.create({
          data: {
            name: input.name,
            description: input.description,
            facultyId: input.facultyId,
            headId: input.headId,
            phone: input.phone,
            universityCreditHours: input.universityCreditHours,
            facultyCreditHours: input.facultyCreditHours,
            programCreditHours: input.programCreditHours,
            programType: input.programType,
            resultDisplay: input.resultDisplay,
          },
          select: {id: true}
        });

        const programId = program.id;

        const createdLevels = await Promise.all(
          input.levels.map((levelInput) =>
            prisma.programLevel.create({
              data: {
                programId,
                level: levelInput.level,
                minCredits: levelInput.minCredits,
                maxCredits: levelInput.maxCredits,
              },
              select: {id: true , level: true}
            })
          )
        );

        const levelIdByNumber = new Map<number, number>(
          createdLevels.map((pl) => [pl.level, pl.id])
        );

        await prisma.programTranscriptDefinition.createMany({
          data: input.transcriptDefinition.map((td) => ({
            programId,
            gradeLetter: td.gradeLetter,
            minScore: td.minScore,
            maxScore: td.maxScore,
            minGpa: td.minGPA,
            maxGpa: td.maxGPA,
            equivalentEstimate: td.equivalentEstimate,
          })),
        });

        await prisma.academicLoadGPA.createMany({
          data: input.academicLoadGPA.map((gpa) => ({
            programId,
            minGpa: gpa.minGPA,
            maxGpa: gpa.maxGPA,
            minCredits: gpa.minCredits,
            maxCredits: gpa.maxCredits,
          })),
        });

        const academicLoadRows: Prisma.AcademicLoadSemesterCreateManyInput[] = [];

        for (const entry of input.academicLoadSemester) {
          const programLevelId = levelIdByNumber.get(entry.level);

          if (!programLevelId) {
            throw new Error(
              `Level ${entry.level} was not found under program ${programId}.`
            );
          }

          academicLoadRows.push({
            programId,
            programLevelId,
            semesterNumber: entry.semester,
            minCredits: entry.minCredits,
            maxCredits: entry.maxCredits,
          });
        }

        await prisma.academicLoadSemester.createMany({ data: academicLoadRows });

        const feeRows: Prisma.FeeCreateManyInput[] = [];

        for (const levelInput of input.levels) {
          const programLevelId = levelIdByNumber.get(levelInput.level);

          if (!programLevelId) {
            throw new Error(
              `Level ${levelInput.level} was not found under program ${programId}.`
            );
          }

          const FALL_SEMESTER = 1 , SPRING_SEMESTER = 2 , SUMMER_SEMESTER = 3;

          for (const fee of levelInput.semesterFees.semester1) {
            feeRows.push({ programLevelId, semesterNumber: FALL_SEMESTER, feeType: fee.feeType, amount: fee.amount, description: fee.description });
          }

          for (const fee of levelInput.semesterFees.semester2) {
            feeRows.push({ programLevelId, semesterNumber: SPRING_SEMESTER, feeType: fee.feeType, amount: fee.amount, description: fee.description });
          }

          for (const fee of levelInput.summerFees) {
            feeRows.push({ programLevelId, semesterNumber: SUMMER_SEMESTER, feeType: fee.feeType, amount: fee.amount, description: fee.description });
          }
        }

        if (feeRows.length) {
          await prisma.fee.createMany({ data: feeRows });
        }

        return { programId };
      }
    );
  }

  static async GetAllPrograms(prisma: DbClient) {
    return await prisma.program.findMany({
        // include: this.programDetailsInclude,
        orderBy: [{ name: "asc" }],
    });
  }

  static async GetProgramById(id: number, prisma: DbClient)  {
    return prisma.program.findUnique({
        where: { id },
        // include: this.programDetailsInclude,
    });
  }

  static async UpdateProgram(id: number, programData: Prisma.ProgramUpdateInput, prisma: DbClient) {
    return prisma.program.update({
        where: { id },
        data: programData,
        // include: this.programDetailsInclude,
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