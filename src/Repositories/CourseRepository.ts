import { Prisma, PrismaClient,GradeEnum, RegistrationStatus } from "@prisma/client";
import { CreateCourse, UpdateCourse } from "../Validators/CourseValidator";

type DbClient = PrismaClient | Prisma.TransactionClient;



export class CourseRepository {


  public static async CreateCourse(data: CreateCourse, prisma: PrismaClient) {
   return prisma.course.create({

    data: {
      // 1. Basic Course Fields
      name: data.name,
      code: data.code,
      credits: data.credits,
      description: data.description,
      syllabus: data.syllabus,
      successPercentage: data.successPercentage,
      minFinalSuccessPercentage: data.minFinalSuccessPercentage,
      totalFail: data.totalFail,

      // 2. Create the first ProgramCourse connection
      // This maps the course to its specific program, level, and type (Mandatory/Elective)
      programCourses: {
        create: {
          programId: data.programId,
          programLevelId: data.programLevelId,
          type: data.courseType,
        },
      },

      // 3. Create the Prerequisites connections
      prerequisites: {
        create: data.prerequisiteIds.map((pId) => ({
          prerequisiteId: pId,
        })),
      },
    },
  });
}

  public static async GetAllCourses(prisma: PrismaClient) {
    return prisma.course.findMany({
      select:{id:true, name: true, code: true, description: true, credits: true,
         syllabus:true, successPercentage: true, prerequisites:{select:{prerequisiteId: true}}, programCourses:{select:{programId: true}}
      },
      orderBy: [{ name: "asc" }]
    });
  }

  public static async GetCourseById(id: number, prisma: PrismaClient) {
    return prisma.course.findUnique({
      where: { id },
      select:{name: true, code: true, description: true, credits: true,
              successPercentage: true, prerequisites:true
      },
    });
  }

  public static async UpdateCourse(id: number, payload: UpdateCourse, prisma: PrismaClient) {
  
  const data = this.prepareUpdatePyaload (id, payload);

  return prisma.course.update({
    where: { id },
    data,
  });
}

  public static async DeleteCourse(id: number, prisma: PrismaClient) {
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
                allowedCapacity: true,
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


  
  private static prepareUpdatePyaload(id: number, payload: UpdateCourse) {
  // 1. Build the base update object
  const data: Prisma.CourseUpdateInput = {
    name: payload.name,
    code: payload.code,
    description: payload.description,
    credits: payload.credits,
    syllabus: payload.syllabus,
    successPercentage: payload.successPercentage,
    minFinalSuccessPercentage: payload.minFinalSuccessPercentage,
    totalFail: payload.totalFail,
  };

  // 2. Safely handle ProgramCourse Upsert
  // Only include this block if we actually have a programLevelId to target
  if (payload.programLevelId && payload.programId && payload.courseType) {
    data.programCourses = {
      upsert: {
        where: {
          programLevelId_courseId: {
            courseId: id,
            programLevelId: payload.programLevelId,
          },
        },
        update: {
          type: payload.courseType,
          programId: payload.programId,
        },
        create: {
          type: payload.courseType,
          programId: payload.programId,
          programLevelId: payload.programLevelId,
        },
      },
    };
  }

  // 3. Safely handle Prerequisites
  // Only sync prerequisites if the array is explicitly provided in the payload
  if (payload.prerequisiteIds?.length) {
    console.log(payload)
    data.prerequisites = {
      deleteMany: {},
      create: payload.prerequisiteIds.map((pId) => ({
        prerequisiteId: pId,
      })),
    };
  }
  return data;

}
}



