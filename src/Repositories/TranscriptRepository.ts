import { Prisma, PrismaClient, RegistrationStatus } from "@prisma/client";
import { GetTenantClient } from "../Utils/prismaClient";

type DbClient = PrismaClient | Prisma.TransactionClient;

type SaveGeneratedTranscriptInput = {
  studentId: number;
  semesterId: number;
  year: number;
  semesterGpa: number;
  cumulativeGpa: number;
  totalCredits: number;
};

export class TranscriptRepository {
  public static async WithTenantClient<T>(
    schemaName: string,
    handler: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return handler(GetTenantClient(schemaName));
  }

  public static async WithTransaction<T>(
    schemaName: string,
    handler: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return GetTenantClient(schemaName).$transaction(handler);
  }

  public static async GetStudentById(studentId: number, prisma: DbClient) {
    return prisma.student.findUnique({ where: { userId: studentId } });
  }

  public static async GetSemesterById(semesterId: number, prisma: DbClient) {
    return prisma.semester.findUnique({ where: { id: semesterId } });
  }

  public static async GetFacultySemesterGenerationContext(
    schemaName: string,
    semesterId: number,
    facultyId: number
  ) {
    return this.WithTenantClient(schemaName, async (prisma) => {
      const [semester, studentRecords] = await Promise.all([
        this.GetSemesterById(semesterId, prisma),
        this.GetStudentIdsForSemesterAndFaculty(semesterId, facultyId, prisma),
      ]);

      return { semester, studentRecords };
    });
  }

  public static async GetProgramTranscriptDefinitions(programId: number, prisma: DbClient) {
    return prisma.programTranscriptDefinition.findMany({
      where: { programId },
      orderBy: { minScore: "desc" },
    });
  }

  public static async GetProgramById(programId: number, prisma: DbClient) {
    return prisma.program.findUnique({
      where: { id: programId },
      select: { id: true, facultyId: true },
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
      select: {
        id: true;
        status: true;
        scheduleSlotContext: {
          select: {
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
      select: {
        id: true,
        status: true,
        scheduleSlotContext: {
          select: {
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
      select: {
        gradePoints: true;
        scheduleSlotContext: {
          select: {
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
      select: {
        id: true,
        semesterId: true,
        gradePoints: true,
        scheduleSlotContext: {
          select: {
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

  public static async SaveGeneratedTranscript(
    input: SaveGeneratedTranscriptInput,
    prisma: DbClient
  ) {
    const transcript = await this.UpsertTranscript(
      input.studentId,
      input.semesterId,
      input.year,
      input.semesterGpa,
      input.cumulativeGpa,
      input.totalCredits,
      prisma
    );

    await this.UpdateStudentCgpa(input.studentId, input.cumulativeGpa, prisma);

    return transcript;
  }

  public static async GetStudentTranscripts(studentId: number, prisma: DbClient) {
    return prisma.transcript.findMany({
      where: { studentId },
      include: {
        semester: true,
      },
      orderBy: [
        { semester: { startDate: "asc" } },
        { semesterId: "asc" },
      ],
    });
  }

  public static async GetStudentTranscriptsForTenant(
    schemaName: string,
    studentId: number
  ) {
    return this.WithTenantClient(schemaName, (prisma) =>
      this.GetStudentTranscripts(studentId, prisma)
    );
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
      include: {
        semester: true,
      },
    });
  }

  public static async GetTranscriptCourseRows(
    studentId: number,
    semesterId: number,
    prisma: DbClient
  ) {
    return prisma.courseRegistration.findMany({
      where: { studentId, semesterId },
      select: {
        id: true,
        status: true,
        grade: true,
        gradePoints: true,
        grades: {
          select: {
            marks: true,
            maxMarks: true,
          },
        },
        scheduleSlotContext: {
          select: {
            slot: {
              select: {
                course: {
                  select: {
                    code: true,
                    name: true,
                    credits: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
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

  public static async GetStudentSemesterTranscriptForTenant(
    schemaName: string,
    studentId: number,
    semesterId: number
  ) {
    return this.WithTenantClient(schemaName, (prisma) =>
      this.GetStudentSemesterTranscript(studentId, semesterId, prisma)
    );
  }

  public static async GetStudentSemesterIds(
    studentId: number,
    prisma: DbClient
  ) {
    const semesters = await prisma.semester.findMany({
      where: {
        courseRegistrations: {
          some: { studentId },
        },
      },
      select: { id: true },
      orderBy: [
        { startDate: "asc" },
        { id: "asc" },
      ],
    });

    return semesters.map((semester) => ({ semesterId: semester.id }));
  }

  public static async GetStudentSemesterIdsForTenant(
    schemaName: string,
    studentId: number
  ) {
    return this.WithTenantClient(schemaName, (prisma) =>
      this.GetStudentSemesterIds(studentId, prisma)
    );
  }

  public static async UpdateStudentCgpa(studentId: number, cumulativeGpa: number, prisma: DbClient) {
    return prisma.student.update({
      where: { userId: studentId },
      data: { cgpa: cumulativeGpa },
    });
  }
}
