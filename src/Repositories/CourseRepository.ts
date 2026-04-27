import { GradeEnum, Prisma, PrismaClient, RegistrationStatus } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class CourseRepository {
  // Keep response shape consistent across create/read/update so frontend does not branch by endpoint.
  private static readonly courseDetailsInclude = {
    programCourses: true,
    coursePrerequisitesFor: true,
    coursePrerequisites: {
      include: {
        prerequisite: true,
      },
    },
  } as const;

  public static async CreateCourse(data: Prisma.CourseCreateInput, prisma: DbClient) {
    return prisma.course.create({
      data,
      include: this.courseDetailsInclude,
    });
  }

  public static async GetAllCourses(prisma: DbClient) {
    return prisma.course.findMany({
      include: this.courseDetailsInclude,
      orderBy: [{ code: "asc" }, { name: "asc" }],
    });
  }

  public static async GetCourseById(id: number, prisma: DbClient) {
    return prisma.course.findUnique({
      where: { id },
      include: this.courseDetailsInclude,
    });
  }

  public static async UpdateCourse(id: number, data: Prisma.CourseUpdateInput, prisma: DbClient) {
    return prisma.course.update({
      where: { id },
      data,
      include: this.courseDetailsInclude,
    });
  }

  public static async DeleteCourse(id: number, prisma: DbClient) {
    return prisma.course.delete({
      where: { id },
    });
  }

  public static async GetStudentAlreadyEnrolledCourses(
    prisma: PrismaClient,
    studentId: number,
    semesterId: number
  ) {
    return prisma.courseRegistration.findMany({
      where: { studentId, semesterId },
      select: {
        id: true,
        slotContextId: true,
        scheduleSlotContext: {
          select: {
            slot: {
              select: {
                id: true,
                classroom: { select: { capacity: true } },
                course: { select: { credits: true, id: true , code: true , name: true } },
              },
            },
          },
        },
      },
    });
  }

    /**
   * Helper to get unique IDs of passed courses.
   */
  public static async GetStudentPassedCourseIds(studentId: number, prisma: DbClient): Promise<number[]> {
    const registrations = await prisma.courseRegistration.findMany({
      where: {
        studentId,
        status: RegistrationStatus.Completed,
        grade: { not: GradeEnum.F }
      },
      select: {
        scheduleSlotContext: {
          select: {
            slot: { select: { courseId: true } }
          }
        }
      }
    });

    // Extract unique course IDs
    return [...new Set(registrations
      .map(r => r.scheduleSlotContext?.slot?.courseId)
      .filter((id): id is number => id !== undefined)
    )];
  }
}
