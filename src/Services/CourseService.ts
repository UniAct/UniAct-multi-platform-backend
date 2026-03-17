import { Prisma } from "@prisma/client";
import { CourseUpsertInput } from "../Interfaces/AcademicProgram";
import { CourseRepository } from "../Repositories/CourseRepository";
import { NotFoundError } from "../Types/Errors";
import { getTenantClient } from "../Utils/prismaClient";

export class CourseService {
  private static buildCreateData(payload: CourseUpsertInput): Prisma.CourseCreateInput {
    const prerequisiteIds = Array.from(new Set(payload.prerequisiteIds ?? []));

    return {
      name: payload.name,
      code: payload.code,
      description: payload.description,
      credits: payload.credits,
      syllabus: payload.syllabus,
      successPercentage: payload.successPercentage,
      minFinalSuccessPercentage: payload.minFinalSuccessPercentage,
      totalFail: payload.totalFail ?? false,
      programCourses: {
        create: {
          type: payload.courseType,
          program: {
            connect: { id: payload.programId },
          },
        },
      },
      coursePrerequisitesFor: prerequisiteIds.length
        ? {
            create: prerequisiteIds.map((prerequisiteId) => ({
              prerequisite: {
                connect: { id: prerequisiteId },
              },
            })),
          }
        : undefined,
    };
  }

  public static async CreateCourse(payload: CourseUpsertInput, schema_name: string) {
    const prisma = getTenantClient(schema_name);
    return prisma.$transaction(async (tx) => {
      return CourseRepository.CreateCourse(this.buildCreateData(payload), tx);
    });
  }

  public static async GetAllCourses(schema_name: string) {
    const prisma = getTenantClient(schema_name);
    return CourseRepository.GetAllCourses(prisma);
  }

  public static async GetCourseById(id: number, schema_name: string) {
    const prisma = getTenantClient(schema_name);
    const course = await CourseRepository.GetCourseById(id, prisma);

    if (!course) {
      throw new NotFoundError("This course doesn't exist");
    }

    return course;
  }

  public static async UpdateCourse(id: number, payload: CourseUpsertInput, schema_name: string) {
    const prisma = getTenantClient(schema_name);
    return prisma.$transaction(async (tx) => {
      const existing = await CourseRepository.GetCourseById(id, tx);
      if (!existing) {
        throw new NotFoundError("This course doesn't exist");
      }

      await tx.coursePrerequisite.deleteMany({ where: { courseId: id } });
      await tx.programCourse.deleteMany({ where: { courseId: id } });

      return CourseRepository.UpdateCourse(
        id,
        {
          name: payload.name,
          code: payload.code,
          description: payload.description,
          credits: payload.credits,
          syllabus: payload.syllabus,
          successPercentage: payload.successPercentage,
          minFinalSuccessPercentage: payload.minFinalSuccessPercentage,
          totalFail: payload.totalFail ?? false,
          programCourses: {
            create: {
              type: payload.courseType,
              program: {
                connect: { id: payload.programId },
              },
            },
          },
          coursePrerequisitesFor:
            payload.prerequisiteIds && payload.prerequisiteIds.length > 0
              ? {
                  create: Array.from(new Set(payload.prerequisiteIds)).map((prerequisiteId) => ({
                    prerequisite: {
                      connect: { id: prerequisiteId },
                    },
                  })),
                }
              : undefined,
        },
        tx,
      );
    });
  }

  public static async DeleteCourse(id: number, schema_name: string) {
    const prisma = getTenantClient(schema_name);
    return prisma.$transaction(async (tx) => {
      const existing = await CourseRepository.GetCourseById(id, tx);
      if (!existing) {
        throw new NotFoundError("This course doesn't exist");
      }

      return CourseRepository.DeleteCourse(id, tx);
    });
  }
}
