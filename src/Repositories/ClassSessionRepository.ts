import { DayOfWeek, Prisma, PrismaClient, Room } from "@prisma/client";
import { GetTenantClient } from "../Utils/prismaClient";

type DbClient = PrismaClient | Prisma.TransactionClient;

type FindConflictingSessionsInput = {
  semesterId: number;
  days: DayOfWeek[];
  teacherIds: number[];
  classroomIds: number[];
  excludeProgramId: number;
  excludeAcademicLevel: number;
};

export class ClassSessionRepository {
  private static getClient(schema_name: string): PrismaClient {
    return GetTenantClient(schema_name);
  }

  public static GetClient(schema_name: string): PrismaClient {
    return this.getClient(schema_name);
  }

  public static async WithTransaction<T>(
    schema_name: string,
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: Prisma.PrismaClientOptions["transactionOptions"] & {
      maxWait?: number;
      timeout?: number;
    },
  ) {
    const prisma = this.getClient(schema_name);
    return prisma.$transaction(operation, options);
  }

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

  public static async GetCoursesForProgram(programId: number, prisma: DbClient) {
    return prisma.programCourse.findMany({
      where: { programId },
      select: {
        courseId: true,
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

  public static async GetCoursesByIdsForProgram(programId: number, courseIds: number[], prisma: DbClient) {
    return prisma.programCourse.findMany({
      where: {
        programId,
        courseId: { in: courseIds },
      },
      select: {
        courseId: true,
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  public static async GetClassroomsByIds(classroomIds: number[], prisma: DbClient) {
    return prisma.classroom.findMany({
      where: {
        id: { in: classroomIds },
      },
      select: {
        id: true,
        roomNumber: true,
        building: true,
        capacity: true,
        type: true,
        isAvailable: true,
      },
    });
  }

  public static async GetAllAvailableClassrooms(prisma: DbClient) {
    return prisma.classroom.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        roomNumber: true,
        building: true,
        capacity: true,
        type: true,
      },
      orderBy: [{ building: "asc" }, { roomNumber: "asc" }],
    });
  }

  public static async GetStaffByIds(teacherIds: number[], prisma: DbClient) {
    return prisma.staff.findMany({
      where: {
        userId: { in: teacherIds },
      },
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

  public static async FindConflictingSessions(input: FindConflictingSessionsInput, prisma: DbClient) {
    return prisma.classSession.findMany({
      where: {
        semesterId: input.semesterId,
        dayOfWeek: { in: input.days },
        OR: [
          { teacherId: { in: input.teacherIds } },
          { classroomId: { in: input.classroomIds } },
        ],
        NOT: {
          programId: input.excludeProgramId,
          academicLevel: input.excludeAcademicLevel,
        },
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        classroom: {
          select: {
            roomNumber: true,
            building: true,
          },
        },
      },
    });
  }

  public static async GetSessionsByLevel(
    programId: number,
    academicLevel: number,
    semesterId: number,
    prisma: DbClient,
  ) {
    return prisma.classSession.findMany({
      where: {
        programId,
        academicLevel,
        semesterId,
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
            roomNumber: true,
            building: true,
            capacity: true,
            type: true,
          },
        },
        teacher: {
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
        },
        room: {
          select: {
            id: true,
            roomName: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }

  public static async DeleteSessionsByLevel(
    programId: number,
    academicLevel: number,
    semesterId: number,
    prisma: DbClient,
  ) {
    return prisma.classSession.deleteMany({
      where: {
        programId,
        academicLevel,
        semesterId,
      },
    });
  }

  public static async CreateManySessions(
    data: Prisma.ClassSessionCreateManyInput[],
    prisma: DbClient,
  ) {
    return prisma.classSession.createMany({ data });
  }

  public static async GetOrCreateAcademicRoom(
    roomName: string,
    createdBy: number,
    prisma: DbClient,
  ): Promise<Room> {
    const existing = await prisma.room.findFirst({
      where: {
        roomName,
        createdBy,
      },
      orderBy: {
        id: "asc",
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.room.create({
      data: {
        roomName,
        description: "Auto-generated academic room for timetable session",
        createdBy,
      },
    });
  }
}
