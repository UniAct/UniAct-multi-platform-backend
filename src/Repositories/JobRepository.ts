import { EnrollmentJobStatus, JobStatus, Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;
export class JobRepository {

  static async CreateJobRecord(file_url: string, prisma: PrismaClient): Promise<string> {
    const job = await prisma.job.create({
      data: {
        file_url,
        status: JobStatus.Pending,
        total_rows: null,
        inserted_rows: null,
        failed_rows: null,
        error_log: Prisma.JsonNull,
        created_at: new Date(),
        started_at: null,
        completed_at: null,
      },
      select: { id: true }
    });

    return job.id;
  }

  static async CheckStudentImportStatus(jobId: string, prisma: PrismaClient) {
    return prisma.job.findFirst({
      where: { id: jobId },
      select: {
        id:            true,
        status:        true,
        file_url:      true,
        inserted_rows: true,
        failed_rows:   true,
        error_log:     true,
        created_at:    true,
        started_at:    true,
        completed_at:  true,
      },
    });
  }

  static async CreateEnrollmentJobRecord(
    studentId: number,
    semesterId: number,
    prisma: DbClient
  ): Promise<string> {
    const job = await prisma.enrollmentJob.create({
      data: {
        studentId,
        semesterId,
        status: EnrollmentJobStatus.Pending,
        result: Prisma.JsonNull,
      },
      select: { id: true }
    });

    return job.id;
  }
}