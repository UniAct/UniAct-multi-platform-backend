import { Prisma, PrismaClient } from "@prisma/client";
import { request, Request } from "express";

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
      where: { programLevelId: levelId },
      select: {
        course: { select: { id: true, code: true, name: true, credits: true } }
      }
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
      const passedCourseIds = await this.getPassedCourseIds(studentId, prisma);
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

  /**
   * Helper to get unique IDs of passed courses.
   */
  private static async getPassedCourseIds(studentId: number, prisma: DbClient): Promise<number[]> {
    const registrations = await prisma.courseRegistration.findMany({
      where: {
        studentId,
        status: 'Completed',
        grade: { not: 'F' }
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