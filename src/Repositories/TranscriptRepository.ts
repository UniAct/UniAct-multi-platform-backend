import { Prisma, PrismaClient, RegistrationStatus, Transcript } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class TranscriptRepository {
  public static async GetStudentById(studentId: number, prisma: DbClient) {
    return prisma.student.findUnique({ where: { userId: studentId } });
  }

  public static async GetSemesterById(semesterId: number, prisma: DbClient) {
    return prisma.semester.findUnique({ where: { id: semesterId } });
  }

  public static async GetProgramTranscriptDefinitions(programId: number, prisma: DbClient) {
    return prisma.programTranscriptDefinition.findMany({
      where: { programId },
      orderBy: { minScore: "desc" },
    });
  }

  public static async GetFacultyRegulationWithMercyRules(facultyId: number, prisma: DbClient) {
    return prisma.regulation.findFirst({
      where: { facultyId },
      include: {
        mercyRules: {
          orderBy: { originalScore: "asc" },
        },
      },
      orderBy: { id: "desc" },
    });
  }

  public static async GetCourseRegistrationsForSemester(
    studentId: number,
    semesterId: number,
    prisma: DbClient
  ): Promise<
    Array<Prisma.CourseRegistrationGetPayload<{
      include: {
        scheduleSlotContext: {
          include: {
            slot: {
              include: {
                course: true;
              };
            };
          };
        };
        grades: {
          include: {
            courseAssessment: true;
          };
        };
      };
    }>>
  > {
    return prisma.courseRegistration.findMany({
      where: { studentId, semesterId },
      include: {
        scheduleSlotContext: {
          include: {
            slot: {
              include: {
                course: true,
              },
            },
          },
        },
        grades: {
          include: {
            courseAssessment: true,
          },
        },
      },
    });
  }

  public static async CountCourseRegistrationsForSemester(
    studentId: number,
    semesterId: number,
    prisma: DbClient
  ) {
    return prisma.courseRegistration.count({
      where: { studentId, semesterId },
    });
  }

  public static async UpdateCourseRegistrationGrade(
    courseRegistrationId: number,
    update: {
      grade: string;
      gradePoints: number;
      status: RegistrationStatus;
    },
    prisma: Prisma.TransactionClient
  ) {
    return prisma.courseRegistration.update({
      where: { id: courseRegistrationId },
      data: {
        grade: update.grade as any,
        gradePoints: update.gradePoints,
        status: update.status,
      },
    });
  }

  public static async GetCompletedCourseRegistrations(
    studentId: number,
    prisma: DbClient
  ): Promise<
    Array<Prisma.CourseRegistrationGetPayload<{
      include: {
        scheduleSlotContext: {
          include: {
            slot: {
              include: {
                course: true;
              };
            };
          };
        };
      };
    }>>
  > {
    return prisma.courseRegistration.findMany({
      where: {
        studentId,
        status: { in: [RegistrationStatus.Completed, RegistrationStatus.Failed] },
      },
      include: {
        scheduleSlotContext: {
          include: {
            slot: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });
  }

  public static async UpsertTranscript(
    studentId: number,
    semesterId: number,
    year: number,
    semesterGpa: number,
    cumulativeGpa: number,
    totalCredits: number,
    prisma: DbClient
  ) {
    return prisma.transcript.upsert({
      where: {
        studentId_semesterId: {
          studentId,
          semesterId,
        },
      },
      update: {
        year,
        semesterGpa: semesterGpa,
        cumulativeGpa: cumulativeGpa,
        totalCredits,
        generatedDate: new Date(),
      },
      create: {
        studentId,
        semesterId,
        year,
        semesterGpa,
        cumulativeGpa,
        totalCredits,
      },
    });
  }

  public static async GetStudentTranscripts(studentId: number, prisma: DbClient) {
    return prisma.transcript.findMany({
      where: { studentId },
      orderBy: { semesterId: "asc" },
    });
  }

  public static async GetStudentSemesterTranscript(
    studentId: number,
    semesterId: number,
    prisma: DbClient
  ) {
    return prisma.transcript.findUnique({
      where: {
        studentId_semesterId: {
          studentId,
          semesterId,
        },
      },
    });
  }

  public static async GetStudentIdsForSemester(semesterId: number, prisma: DbClient) {
    return prisma.courseRegistration.findMany({
      where: { semesterId },
      distinct: ["studentId"],
      select: { studentId: true },
    });
  }

  public static async GetStudentIdsForSemesterAndFaculty(
    semesterId: number,
    facultyId: number,
    prisma: DbClient
  ) {
    return prisma.courseRegistration.findMany({
      where: {
        semesterId,
        student: {
          program: {
            facultyId,
          },
        },
      },
      distinct: ["studentId"],
      select: {
        studentId: true,
        student: {
          select: {
            programLevel: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    });
  }
}
