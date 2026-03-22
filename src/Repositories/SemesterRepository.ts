import { Prisma, PrismaClient, Semester } from "@prisma/client";

export class SemesterRepository {

  public static async CreateSemester(
    semesterData: Prisma.SemesterCreateInput,
    prisma: PrismaClient
  ): Promise<Semester> {
    return await prisma.semester.create({
      data: semesterData
    });
  }

  public static async UpdateSemester(
    semesterId: number,
    semesterData: Prisma.SemesterUpdateInput,
    prisma: PrismaClient
  ): Promise<Semester> {
    return await prisma.semester.update({
      where: { id: semesterId },
      data: semesterData
    });
  }

  public static async DeleteSemester(
    semesterId: number,
    prisma: PrismaClient
  ): Promise<Semester> {
    return await prisma.semester.delete({
      where: { id: semesterId }
    });
  }

  public static async GetAllSemesters(
    prisma: PrismaClient
  ): Promise<Semester[]> {
    return await prisma.semester.findMany({
      orderBy: [
        { year: "desc" },
        { number: "desc" }
      ]
    });
  }

  public static async GetSemesterById(
    semesterId: number,
    prisma: PrismaClient
  ): Promise<Semester | null> {
    return await prisma.semester.findUnique({
      where: { id: semesterId }
    });
  }


  public static async SemesterExistsByYearAndNumber(
    year: number,
    number: number,
    prisma: PrismaClient
  ): Promise<boolean> {
    const semester = await prisma.semester.findUnique({
      where: {
        year_number: { 
          year: year,
          number: number
        }
      },
      select: { id: true }
    });
    return semester !== null;
  }

  public static async SemesterExistsByYearAndNumberExcludingId(
    year: number,
    number: number,
    excludeId: number,
    prisma: PrismaClient
  ): Promise<boolean> {
    const semester = await prisma.semester.findFirst({
      where: {
        year: year,
        number: number,
        id: { not: excludeId }
      },
      select: { id: true }
    });
    return semester !== null;
  }

  //checks whether a new semester date range overlaps with any existing semester in the database

  public static async isSemesterDateOverlapping(
    startDate: Date,
    endDate: Date,
    prisma: PrismaClient,
    excludeSemesterId?: number
  ): Promise<boolean> {
    const conflict = await prisma.semester.findFirst({
      where: {
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
          excludeSemesterId ? { id: { not: excludeSemesterId } } : {}
        ]
      }
    });

    return conflict !== null;
  }
}