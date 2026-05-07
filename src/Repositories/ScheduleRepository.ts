import { GradeEnum, Prisma, PrismaClient, RegistrationStatus } from "@prisma/client";
import { request, Request } from "express";
import { CourseRepository } from "./CourseRepository";

type DbClient = PrismaClient | Prisma.TransactionClient;


export class ScheduleRepository {

  public static async GetProgram(programId: number, level: number, prisma: DbClient) {
    return prisma.program.findUnique({
      where: { id: programId },
      select: {
        name: true,
        facultyId: true,
        programLevels: {
          where: { level },
          select: { id: true }
        }
      }
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

  public static async GetStaffByFaculty(facultyId: number, prisma: PrismaClient) {
    return prisma.programStaff.findMany({
      where: { facultyId },
      distinct: ['staffId'],
      select: {
        staffId: true,
        staff: { select: { user: { select: { firstName: true, lastName: true } } } }
      }
    });
  }

  public static async GetCoursesByLevel(levelId: number, prisma: DbClient) {
    return prisma.programCourse.findMany({
      select: {
        course: { select: { id: true, code: true, name: true, credits: true } },
      },
      orderBy:{programLevelId:'desc'}
    });
  }

  public static async GetScheduleSlotsWithContext(
    programId: number,
    level: number,
    semesterId: number,
    prisma: DbClient,
    studentId?: number
  ) {
    let studentFilter = {};

    if (studentId) {
      console.log("He is a studenttt");
      // 1. Get IDs of courses the student has passed (Status = Completed, Grade != F)
      const passedCourseIds = await CourseRepository.GetStudentPassedCourseIds(studentId, prisma);
      // 2. Define the Eligibility Filter
      // Translation: Show me slots where the course has NO prerequisite that the student didn't pass yet .
      studentFilter = {
        slot: {
          course: {
            coursePrerequisitesFor: {
              none: {
                prerequisiteId: { notIn: passedCourseIds }
              }
            }
          }
        }
      };
    }

    return prisma.scheduleSlotContext.findMany({
      where: {
        programId,
        academicLevel: level,
        semesterId,
        ...studentFilter //there won't be any filters for admins
      },
      include: {
        slot: {
          include: {
            teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
            course: { select: { id: true, name: true, credits: true } },
            classroom: true
          }
        },
        learningGroup: { select: { id: true, GroupName: true } }
      }
    });
  }

  public static async GetRequestedScheduleSlotContexts(
    prisma: PrismaClient,
    submittedContextIds: number[],
    studentProgramId: number,
    semesterId: number
  ) {
    return prisma.scheduleSlotContext.findMany({
      where: {
        id: { in: submittedContextIds },
        programId: studentProgramId,
        semesterId,
      },
      include: {
        slot: {
          include: {
            course: {
              include: {
                prerequisites: true,
              },
            },
          },
        },
      },
    });
  }
}