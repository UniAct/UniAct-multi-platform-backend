import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class CourseRepository {
  public static async CreateCourse(data: Prisma.CourseCreateInput, prisma: DbClient) {
    return prisma.course.create({
      data,
      include: {
        programCourses: true,
        coursePrerequisitesFor: true,
        coursePrerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
    });
  }

  public static async GetAllCourses(prisma: DbClient) {
    return prisma.course.findMany({
      include: {
        programCourses: true,
        coursePrerequisitesFor: true,
        coursePrerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
      orderBy: [{ code: "asc" }, { name: "asc" }],
    });
  }

  public static async GetCourseById(id: number, prisma: DbClient) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        programCourses: true,
        coursePrerequisitesFor: true,
        coursePrerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
    });
  }

  public static async UpdateCourse(id: number, data: Prisma.CourseUpdateInput, prisma: DbClient) {
    return prisma.course.update({
      where: { id },
      data,
      include: {
        programCourses: true,
        coursePrerequisitesFor: true,
        coursePrerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
    });
  }

  public static async DeleteCourse(id: number, prisma: DbClient) {
    return prisma.course.delete({
      where: { id },
    });
  }
}
