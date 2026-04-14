import { DayOfWeek, LearningGroup, Prisma, PrismaClient} from "@prisma/client";
import { GetTenantClient } from "../Utils/prismaClient";

type DbClient = PrismaClient | Prisma.TransactionClient;


export class ClassSessionRepository {

  public static async GetProgramById(programId: number, prisma: DbClient) {
    return prisma.program.findUnique({
      where: { id: programId },
      select: {
        id: true,
        name: true,
      },
    });
  }

  public static async GetProgramLevel(programId: number, level: number, prisma: DbClient) {
    return prisma.programLevel.findFirst({
      where: {
        programId,
        level,
      },
      select: {
        id: true,
        level: true,
      },
    });
  }

  public static async GetCoursesByProgramId(programId: number, prisma: DbClient) {
    return prisma.programCourse.findMany({
      where: { programId },
      select: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
          },
        },
      },
      orderBy: {
        course: {
          code: "asc",
        },
      },
    });
  }


  public static async GetAllAvailableClassrooms(prisma: DbClient) {
    return prisma.classroom.findMany({
      where: { underMaintenance: false },
      select: {
        id: true,
        classroomNumber: true,
        building: true,
        capacity: true,
        type: true,
      },
      orderBy: [{ building: "asc" }, { classroomNumber: "asc" }],
    });
  }


  public static async GetAllStaff(prisma: DbClient) {
    return prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: "asc",
        },
      },
    });
  }

  public static async GetScheduleSlots(
    programId: number,
    academicLevel: number,
    semesterId: number,
    prisma: DbClient,
  ) {
    return prisma.scheduleSlot.findMany({
      where: {
        programId,
        semesterId,
        academicLevel,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        classroom: {
          select: {
            id: true,
            classroomNumber: true,
            building: true,
            capacity: true,
            type: true,
          },
        },
        teacher: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        learningGroup: {
          select: {
            id: true,
            GroupName: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }



  public static async GetOrCreateAcademicRoom(
    GroupName: string,
    createdBy: number,
    prisma: DbClient,
  ): Promise<LearningGroup> {
    const existing = await prisma.learningGroup.findFirst({
      where: {
        GroupName,
        createdBy,
      },
      orderBy: {
        id: "asc",
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.learningGroup.create({
      data: {
        GroupName,
        description: "Auto-generated academic room for timetable session",
        createdBy,
      },
    });
  }
}
