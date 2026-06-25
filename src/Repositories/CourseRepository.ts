import { Prisma, PrismaClient,GradeEnum, RegistrationStatus, CourseAssessmentType } from "@prisma/client";
import { CreateCourse, UpdateCourse } from "../Validators/CourseValidator";
import { AssignCourseAssessmentBodyType } from "../Interfaces/Course/AssignCourseAssessment/AssignCourseAssessmentSchema";
import { UpdateCourseAssessmentBodyType } from "../Interfaces/Course/UpdateCourseAssessment/UpdateCourseAssessmentSchema";
import { CreateCourseAssessmentBodyType } from "../Interfaces/Course/CreateCourseAssessment/CreateCourseAssessmentSchema";

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
                course: {
                  select: {
                    credits: true,
                    id: true,
                    code: true,
                    name: true,
                    learningGroups: {
                      where: { semesterId },
                      select: { id: true },
                    },
                  },
                },
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

  public static async GetAllStaffCourses(staffId: number, semesterId: number, prisma: DbClient) {
    return await prisma.scheduleSlot.findMany({
      where: {
        semesterId,
        teacherId: staffId
      },
      distinct: ["courseId"],
      select: {
        course: {
          select: {
            id:          true,
            name:        true,
            code:        true,
            description: true,
            credits:     true,
          },
        },
      },
    });
  }

  public static async IsStaffAssignedToCourse(
    staffId: number,
    courseId: number,
    semesterId: number | null,
    prisma: DbClient
  ) {
    const assignedSlot = await prisma.scheduleSlot.findFirst({
      where: {
        teacherId: staffId,
        courseId,
        ...(semesterId ? { semesterId } : {}),
      },
      select: { id: true },
    });

    return !!assignedSlot;
  }

  public static async GetScheduleSlotAccessContext(scheduleSlotId: number, prisma: DbClient) {
    return await prisma.scheduleSlot.findUnique({
      where: { id: scheduleSlotId },
      select: {
        id: true,
        courseId: true,
        semesterId: true,
        teacherId: true,
      },
    });
  }

  public static async GetSlotContextAccessContext(slotContextId: number, prisma: DbClient) {
    return await prisma.scheduleSlotContext.findUnique({
      where: { id: slotContextId },
      select: {
        id: true,
        semesterId: true,
        slot: {
          select: {
            courseId: true,
            teacherId: true,
          },
        },
      },
    });
  }

  public static async GetCourseAssessmentByCourseAndSemester<T extends Prisma.CourseAssessmentSelect>(
    courseId:   number,
    semesterId: number,
    prisma:     DbClient,
    select?:    T
  ): Promise<Prisma.CourseAssessmentGetPayload<{ select: T }>[]> {
    const results = await prisma.courseAssessment.findMany({
      where: { courseId, semesterId },
      ...(select && { select }),
    });

    return results as Prisma.CourseAssessmentGetPayload<{ select: T }>[];
  }

  public static async CourseAssessmentBulkCreate(
    courseId:    number,
    semesterId:  number,
    assessments: AssignCourseAssessmentBodyType["assessments"],
    prisma:      DbClient
  ) {
    return await prisma.courseAssessment.createManyAndReturn({
      data: assessments.map((a) => ({
        courseId,
        semesterId,
        label:          a.label,
        assessmentType: a.assessmentType as CourseAssessmentType,
        marks:          a.marks,
      })),
    });
  }

  public static async CourseAssessmentCreate(
    courseId: number,
    semesterId: number,
    assessment: CreateCourseAssessmentBodyType,
    prisma: DbClient
  ) {
    return await prisma.courseAssessment.create({
      data: {
        courseId,
        semesterId,
        label: assessment.label,
        assessmentType: assessment.assessmentType as CourseAssessmentType,
        marks: assessment.marks,
      },
      select: {
        id: true,
        label: true,
        assessmentType: true,
        marks: true,
      },
    });
  }

  public static async GetCourseStudents(courseId: number, semesterId: number, prisma: DbClient) {
    return await prisma.courseRegistration.findMany({
      where: {
        status: RegistrationStatus.Enrolled,
        scheduleSlotContext: {
          slot: { courseId, semesterId },
        },
      },
      select: {
        grades: {
          select: {
            id:    true,  
            marks: true,
            courseAssessment: {
              select: {
                label: true,
                marks: true,
              },
            },
          },
        },
        student: {
          select: {
            universityStudentId: true,
            user: {
              select: {
                firstName: true,
                lastName:  true,
              },
            },
          },
        },
      },
    });
  }

  public static async GetStudentGradeById(gradeId: number, prisma: DbClient) {
    return await prisma.grade.findUnique({
      where:  { id: gradeId },
      select: { 
        id:      true,
        maxMarks: true,
        courseAssessment: {
          select: {
            courseId: true,
            semesterId: true,
          },
        },
      },
    });
  }

  public static async GetCourseAssessmentById(assessmentId: number, prisma: DbClient) {
    return await prisma.courseAssessment.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        courseId: true,
        semesterId: true,
        label: true,
      },
    });
  }

  public static async UpdateById(gradeId: number, marks: number, prisma: DbClient) {
    return await prisma.grade.update({
      where: { id: gradeId },
      data:  { marks },
      select: {
        id:    true,
        marks: true,
        maxMarks: true,
        courseAssessment: {
          select: {
            label:          true,
            assessmentType: true,
          },
        },
      },
    });
  }

  public static async GetEnrolledRegistrationIds(
    courseId:   number,
    semesterId: number,
    prisma:     DbClient
  ) {
    return await prisma.courseRegistration.findMany({
      where: {
        status: RegistrationStatus.Enrolled,
        scheduleSlotContext: {
          slot: { courseId, semesterId },
        },
      },
      select: { id: true },
    });
  }

  public static async StudentGradeBulkCreate(
    grades: {
      courseRegistrationId: number;
      courseAssessmentId:   number;
      marks:                number;
      maxMarks:             number;
    }[],
    prisma: DbClient
  ) {
    return await prisma.grade.createMany({
      data: grades,
    });
  }

  public static async UpdateCourseAssessments(
    assessments: UpdateCourseAssessmentBodyType["assessments"],
    prisma:      DbClient
  ) {
    return await prisma.$transaction(async (tx) => {
      // update all assessments and collect results
      const updatedAssessments = await Promise.all(
        assessments.map((a) =>
          tx.courseAssessment.update({
            where: { id: a.assessmentId },
            data:  {
              label: a.label,
              marks: a.marks,
              ...(a.assessmentType ? { assessmentType: a.assessmentType as CourseAssessmentType } : {}),
            },
            select: {
              id:             true,
              label:          true,
              assessmentType: true,
              marks:          true,
            },
          })
        )
      );

      // sync maxMarks on every related grade row
      await Promise.all(
        assessments.map((a) =>
          tx.grade.updateMany({
            where: { courseAssessmentId: a.assessmentId },
            data:  { maxMarks: a.marks },
          })
        )
      );

      return updatedAssessments;
    });
  }

  public static async DeleteCourseAssessment(assessmentId: number, prisma: DbClient) {
    return await prisma.courseAssessment.delete({
      where: { id: assessmentId },
      select: {
        id: true,
        label: true,
        assessmentType: true,
        marks: true,
      },
    });
  }
}
