import { PrismaClient, Prisma, AttendanceStatus } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

function toAttendanceStatus(status: string): AttendanceStatus {
  switch (status.trim().toLowerCase()) {
    case "present":
      return AttendanceStatus.Present;
    case "absent":
      return AttendanceStatus.Absent;
    case "late":
      return AttendanceStatus.Late;
    case "excused":
      return AttendanceStatus.Excused;
    case "medical":
      return AttendanceStatus.Medical;
    default:
      throw new Error(`Unsupported attendance status: ${status}`);
  }
}

export class AttendanceRepository {
  public static async GetAttendanceCourseOptions(
    prisma: DbClient,
    semesterId: number,
    filters?: {
      teacherId?: number | null;
      programId?: number | null;
      academicLevel?: number | null;
    },
  ) {
    return prisma.scheduleSlotContext.findMany({
      where: {
        semesterId,
        ...(filters?.programId ? { programId: filters.programId } : {}),
        ...(filters?.academicLevel ? { academicLevel: filters.academicLevel } : {}),
        ...(filters?.teacherId ? { slot: { is: { teacherId: filters.teacherId } } } : {}),
      },
      select: {
        id: true,
        programId: true,
        academicLevel: true,
        program: {
          select: {
            id: true,
            name: true,
          },
        },
        slot: {
          select: {
            id: true,
            teacherId: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            type: true,
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { programId: "asc" },
        { academicLevel: "asc" },
        { id: "asc" },
      ],
    });
  }

  public static async CreateAttendanceSession(data: Prisma.AttendanceSessionCreateInput, prisma: DbClient) {
    return prisma.attendanceSession.create({ data });
  }

  public static async GetAttendanceSessionById(id: number, prisma: DbClient) {
    return prisma.attendanceSession.findUnique({
      where: { id },
      include: { attendance: true, facultyMember: true, scheduleSlot: true },
    });
  }

  public static async GetAttendanceSessionBySlotAndDate(
    scheduleSlotId: number,
    sessionDate: Date,
    prisma: DbClient,
  ) {
    const startOfDay = new Date(Date.UTC(
      sessionDate.getUTCFullYear(),
      sessionDate.getUTCMonth(),
      sessionDate.getUTCDate(),
      0,
      0,
      0,
      0,
    ));
    const nextDay = new Date(startOfDay);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    return prisma.attendanceSession.findFirst({
      where: {
        scheduleSlotId,
        sessionDate: {
          gte: startOfDay,
          lt: nextDay,
        },
      },
      include: {
        attendance: true,
        facultyMember: true,
        scheduleSlot: true,
      },
    });
  }

  public static async GetEnrolledStudentsBySlotContext(slotContextId: number, prisma: DbClient) {
    // Find course registrations for the given slot context and include student info
    return prisma.courseRegistration.findMany({
      where: { slotContextId },
      select: {
        id: true,
        studentId: true,
        student: {
          select: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });
  }

  public static async UpsertStudentAttendances(
    attendanceSessionId: number,
    records: Array<{ studentId: number; status: string; deviceIp?: string | null; deviceMac?: string | null; notes?: string | null }>,
    prisma: DbClient,
  ) {
    // Simpler approach: delete existing for session and recreate (keeps logic straightforward)
    return prisma.$transaction(async (tx) => {
      await tx.studentAttendance.deleteMany({ where: { attendanceSessionId } });

      if (records.length === 0) return [];

      const createData = records.map((r) => ({
        attendanceSessionId,
        studentId: r.studentId,
        status: toAttendanceStatus(r.status),
        deviceIp: r.deviceIp ?? null,
        deviceMac: r.deviceMac ?? null,
        notes: r.notes ?? null,
      }));

      return tx.studentAttendance.createMany({ data: createData });
    });
  }

  /**
   * Fetch enrolled students by courseId + semesterId (used when there are no timetable slots)
   */
  public static async GetEnrolledStudentsByCourse(courseId: number, semesterId: number | null, prisma: DbClient) {
    // When semesterId is provided, filter by semester. Otherwise return registrations across semesters.
    const whereClause: any = {
      scheduleSlotContext: {
        slot: {
          courseId: courseId,
        },
      },
    };

    if (semesterId) {
      whereClause.semesterId = semesterId;
    }

    return prisma.courseRegistration.findMany({
      where: whereClause,
      select: {
        id: true,
        studentId: true,
        student: {
          select: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });
  }

  public static async GetStudentTodaySchedule(
    prisma: DbClient,
    studentId: number,
    semesterId: number,
    dayOfWeek: string,
  ) {
    return prisma.courseRegistration.findMany({
      where: {
        studentId,
        semesterId,
        slotContextId: { not: null },
        scheduleSlotContext: {
          slot: {
            dayOfWeek: dayOfWeek as any,
          },
        },
      },
      orderBy: {
        scheduleSlotContext: {
          slot: {
            startTime: "asc",
          },
        },
      },
      select: {
        id: true,
        status: true,
        scheduleSlotContext: {
          select: {
            id: true,
            slot: {
              select: {
                id: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                course: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    credits: true,
                  },
                },
                classroom: {
                  select: {
                    id: true,
                    building: true,
                    classroomNumber: true,
                  },
                },
                teacher: {
                  select: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
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

  public static async GetStaffTodaySchedule(
    prisma: DbClient,
    staffId: number,
    semesterId: number,
    dayOfWeek: string,
  ) {
    return prisma.scheduleSlot.findMany({
      where: {
        teacherId: staffId,
        semesterId,
        dayOfWeek: dayOfWeek as any,
      },
      orderBy: {
        startTime: "asc",
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        dayOfWeek: true,
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
          },
        },
        classroom: {
          select: {
            id: true,
            building: true,
            classroomNumber: true,
          },
        },
        slotContext: {
          select: {
            id: true,
            program: {
              select: {
                id: true,
                name: true,
              },
            },
            academicLevel: true,
          },
        },
      },
    });
  }

  public static async GetStudentRegistrationStats(
    prisma: DbClient,
    studentId: number,
    semesterId: number,
  ) {
    const registrations = await prisma.courseRegistration.findMany({
      where: {
        studentId,
        semesterId,
        slotContextId: { not: null },
      },
      select: {
        scheduleSlotContext: {
          select: {
            slot: {
              select: {
                course: {
                  select: {
                    credits: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const registeredCourses = registrations.length;
    const registeredCreditHours = registrations.reduce<number>((sum, item) => {
      return sum + (item.scheduleSlotContext?.slot.course.credits ?? 0);
    }, 0);

    return {
      registeredCourses,
      registeredCreditHours,
    };
  }

  public static async GetStaffTeachingStats(
    prisma: DbClient,
    staffId: number,
    semesterId: number,
  ) {
    const slots = await prisma.scheduleSlot.findMany({
      where: {
        teacherId: staffId,
        semesterId,
      },
      select: {
        id: true,
        courseId: true,
        slotContext: {
          select: {
            registrations: {
              select: { id: true },
            },
          },
        },
      },
    });

    const distinctCourseCount = new Set(slots.map((slot) => slot.courseId)).size;
    const enrolledStudents = slots.reduce((count, slot) => {
      const contextRegistrations = slot.slotContext.reduce((acc, context) => {
        return acc + context.registrations.length;
      }, 0);

      return count + contextRegistrations;
    }, 0);

    return {
      totalSessions: slots.length,
      distinctCourseCount,
      enrolledStudents,
    };
  }

  public static async GetStudentAttendanceStatusTimeline(
    prisma: DbClient,
    studentId: number,
    semesterId: number,
  ) {
    return prisma.studentAttendance.findMany({
      where: {
        studentId,
        attendanceSession: {
          scheduleSlot: {
            semesterId,
          },
        },
      },
      orderBy: {
        attendanceSession: {
          sessionDate: "desc",
        },
      },
      select: {
        id: true,
        status: true,
        recordedAt: true,
        attendanceSession: {
          select: {
            id: true,
            sessionDate: true,
            attendanceMode: true,
            scheduleSlot: {
              select: {
                id: true,
                course: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  public static async IsStudentEnrolledInSession(
    prisma: DbClient,
    studentId: number,
    scheduleSlotId: number,
    semesterId: number,
  ) {
    const registration = await prisma.courseRegistration.findFirst({
      where: {
        studentId,
        semesterId,
        scheduleSlotContext: {
          slotId: scheduleSlotId,
        },
      },
      select: { id: true },
    });

    return !!registration;
  }

  public static async UpsertSingleStudentAttendance(
    prisma: DbClient,
    attendanceSessionId: number,
    studentId: number,
    status: string,
    notes?: string | null,
  ) {
    return prisma.studentAttendance.upsert({
      where: {
        attendanceSessionId_studentId: {
          attendanceSessionId,
          studentId,
        },
      },
      update: {
        status: toAttendanceStatus(status),
        notes: notes ?? null,
      },
      create: {
        attendanceSessionId,
        studentId,
        status: toAttendanceStatus(status),
        notes: notes ?? null,
      },
    });
  }
}
