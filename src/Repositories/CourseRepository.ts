import { Prisma, PrismaClient } from "@prisma/client";

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
}
