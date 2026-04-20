import { Prisma, PrismaClient } from "@prisma/client";

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

  public static async GetScheduleSlotsWithContext(programId: number, level: number, semesterId: number, prisma: DbClient) {
    const args = Prisma.validator<Prisma.ScheduleSlotContextFindManyArgs>()({
      where: {
        programId,
        academicLevel: level,
        semesterId,
      },
      include: {
         // Join the physical data
        slot: {
          include: {
            
            teacher: {
              select: { user: { select: { firstName: true, lastName: true } } }
            },
            course:{
              select:{id:true, name:true, credits:true}
            },
            classroom: true
          }
        },

        learningGroup: {
          select: { id: true, GroupName: true }
        }
      }
    });

    return prisma.scheduleSlotContext.findMany(args);
  }

}
