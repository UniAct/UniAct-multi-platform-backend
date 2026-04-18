import { Prisma, PrismaClient} from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;


export class ScheduleRepository {

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
        course: { select: { id: true, code: true, name: true, credits:true } }
      }
    });
  }

  public static async GetScheduleSlots(programId: number, level: number, semesterId: number, prisma: Prisma.TransactionClient | DbClient) {
     return prisma.scheduleSlot.findMany({
      where: { programId, academicLevel: level, semesterId },
      include: {
        course: { select: { id: true, code: true, name: true , credits: true} },
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
        classroom: { select: { id: true, building: true, classroomNumber: true , capacity:true} },
        learningGroup: { select: { id: true, GroupName: true } },
      }
    });
  }

}
