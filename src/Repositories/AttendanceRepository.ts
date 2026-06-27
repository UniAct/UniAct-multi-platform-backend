import { PrismaClient, Prisma, AttendanceStatus, RegistrationStatus } from "@prisma/client";

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
  public static async GetAttendanceCourseSummaries(
    prisma: DbClient,
    semesterId: number,
    filters?: {
      teacherId?: number | null;
    },
  ) {
    return prisma.scheduleSlot.findMany({
      where: {
        semesterId,
        ...(filters?.teacherId ? { teacherId: filters.teacherId } : {}),
      },
      distinct: ["courseId"],
      select: {
        courseId: true,
        teacherId: true,
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            description: true,
          },
        },
      },
      orderBy: [
        { courseId: "asc" },
      ],
    });
  }

  public static async GetAttendanceCourseOptions(
    prisma: DbClient,
    semesterId: number,
    filters?: {
      teacherId?: number | null;
      programId?: number | null;
      academicLevel?: number | null;
      courseId?: number | null;
    },
  ) {
    const slotFilters: Record<string, number> = {};
    if (filters?.teacherId) slotFilters.teacherId = filters.teacherId;
    if (filters?.courseId) slotFilters.courseId = filters.courseId;

    return prisma.scheduleSlotContext.findMany({
      where: {
        semesterId,
        ...(filters?.programId ? { programId: filters.programId } : {}),
        ...(filters?.academicLevel ? { academicLevel: filters.academicLevel } : {}),
        ...(Object.keys(slotFilters).length > 0 ? { slot: { is: slotFilters } } : {}),
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
      include: {
        attendance: { orderBy: { studentId: "asc" } },
        facultyMember: true,
        scheduleSlot: true,
      },
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

    const sessions = await prisma.attendanceSession.findMany({
      where: {
        scheduleSlotId,
        sessionDate: {
          gte: startOfDay,
          lt: nextDay,
        },
      },
      orderBy: { id: "desc" },
      include: {
        attendance: { orderBy: { studentId: "asc" } },
        facultyMember: true,
        scheduleSlot: true,
      },
    });

    return sessions.sort((left, right) => {
      const attendanceDelta = right.attendance.length - left.attendance.length;
      return attendanceDelta !== 0 ? attendanceDelta : right.id - left.id;
    })[0] ?? null;
  }

  public static async GetEnrolledStudentsBySlotContext(slotContextId: number, prisma: DbClient) {
    // Find course registrations for the given slot context and include student info
    return prisma.courseRegistration.findMany({
      where: {
        slotContextId,
        status: RegistrationStatus.Enrolled,
      },
      distinct: ["studentId"],
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
      },
      orderBy: { studentId: "asc" },
    });
  }

  public static async UpsertStudentAttendances(
    attendanceSessionId: number,
    records: Array<{ studentId: number; status: string; deviceIp?: string | null; deviceMac?: string | null; notes?: string | null }>,
    prisma: DbClient,
  ) {
    return prisma.$transaction(async (tx) => {
      if (records.length === 0) return [];

      const recordsByStudentId = new Map<number, typeof records[number]>();
      records.forEach((record) => {
        recordsByStudentId.set(record.studentId, record);
      });

      const savedAttendances = [];

      for (const record of recordsByStudentId.values()) {
        const data = {
          status: toAttendanceStatus(record.status),
          deviceIp: record.deviceIp ?? null,
          deviceMac: record.deviceMac ?? null,
          notes: record.notes ?? null,
          recordedAt: new Date(),
        };

        const existingRecords = await tx.studentAttendance.findMany({
          where: {
            attendanceSessionId,
            studentId: record.studentId,
          },
          orderBy: { id: "desc" },
        });

        if (existingRecords.length > 0) {
          const [recordToKeep, ...duplicates] = existingRecords;

          if (duplicates.length > 0) {
            await tx.studentAttendance.deleteMany({
              where: {
                id: { in: duplicates.map((duplicate) => duplicate.id) },
              },
            });
          }

          savedAttendances.push(
            await tx.studentAttendance.update({
              where: { id: recordToKeep.id },
              data,
            }),
          );
          continue;
        }

        savedAttendances.push(
          await tx.studentAttendance.create({
            data: {
              attendanceSessionId,
              studentId: record.studentId,
              ...data,
            },
          }),
        );
      }

      return savedAttendances.sort((left, right) => left.studentId - right.studentId);
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

  public static async GetStudentCreditProgress(prisma: DbClient, studentId: number) {
    const [student, completedRegistrations] = await Promise.all([
      prisma.student.findUnique({
        where: { userId: studentId },
        select: {
          program: {
            select: {
              id: true,
              name: true,
              universityCreditHours: true,
              facultyCreditHours: true,
              programCreditHours: true,
              faculty: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.courseRegistration.findMany({
        where: {
          studentId,
          status: RegistrationStatus.Completed,
          grade: { not: null },
          gradePoints: { not: null },
          slotContextId: { not: null },
        },
        select: {
          scheduleSlotContext: {
            select: {
              slot: {
                select: {
                  course: {
                    select: {
                      id: true,
                      credits: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const completedCourseIds = new Set<number>();
    let completedCreditHours = 0;

    for (const registration of completedRegistrations) {
      const course = registration.scheduleSlotContext?.slot.course;
      if (!course || completedCourseIds.has(course.id)) {
        continue;
      }

      completedCourseIds.add(course.id);
      completedCreditHours += course.credits;
    }

    const requirements = student?.program
      ? {
          university: student.program.universityCreditHours,
          faculty: student.program.facultyCreditHours,
          program: student.program.programCreditHours,
          total:
            student.program.universityCreditHours +
            student.program.facultyCreditHours +
            student.program.programCreditHours,
        }
      : {
          university: 0,
          faculty: 0,
          program: 0,
          total: 0,
        };

    return {
      completedCourses: completedCourseIds.size,
      completedCreditHours,
      requirements,
      program: student?.program
        ? {
            id: student.program.id,
            name: student.program.name,
          }
        : null,
      faculty: student?.program?.faculty ?? null,
    };
  }

  public static async GetStudentMobileTimetable(
    prisma: DbClient,
    studentId: number,
    semesterId: number,
  ) {
    return prisma.courseRegistration.findMany({
      where: {
        studentId,
        semesterId,
        slotContextId: { not: null },
      },
      orderBy: [
        {
          scheduleSlotContext: {
            slot: {
              dayOfWeek: "asc",
            },
          },
        },
        {
          scheduleSlotContext: {
            slot: {
              startTime: "asc",
            },
          },
        },
      ],
      select: {
        id: true,
        status: true,
        scheduleSlotContext: {
          select: {
            id: true,
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
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                type: true,
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
                    capacity: true,
                  },
                },
                teacher: {
                  select: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
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

  public static async GetStaffMobileTimetable(
    prisma: DbClient,
    staffId: number,
    semesterId: number,
  ) {
    return prisma.scheduleSlot.findMany({
      where: {
        teacherId: staffId,
        semesterId,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        type: true,
        allowedCapacity: true,
        enrolledSeats: true,
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
            capacity: true,
          },
        },
        slotContext: {
          select: {
            id: true,
            academicLevel: true,
            program: {
              select: {
                id: true,
                name: true,
              },
            },
            registrations: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
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
