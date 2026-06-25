import { EnrollmentJobStatus, JobStatus, Prisma, PrismaClient, TranscriptJobStatus } from "@prisma/client";
import { GetTenantClient } from "../Utils/prismaClient";

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


  static async CheckStudentEnrollmentStatus(
    jobId: string,
    prisma: DbClient
  ){
    return await prisma.enrollmentJob.findFirst({
      where: {id: jobId},
      select: {
        id: true,
        status: true,
        studentId: true,
        result: true,
      }
    });
  }

  static async CreateTranscriptJobRecord(
    facultyId: number,
    semesterId: number,
    prisma: DbClient
  ): Promise<string> {
    const job = await prisma.transcriptJob.create({
      data: {
        facultyId,
        semesterId,
        status: TranscriptJobStatus.Pending,
        result: Prisma.JsonNull,
      },
      select: { id: true }
    });

    return job.id;
  }

  static async CreateTranscriptJobRecordForTenant(
    schemaName: string,
    facultyId: number,
    semesterId: number
  ): Promise<string> {
    return this.CreateTranscriptJobRecord(
      facultyId,
      semesterId,
      GetTenantClient(schemaName)
    );
  }


  static async UpdateTranscriptJob(
    jobId: string,
    update: {
      status?: TranscriptJobStatus;
      result?: Prisma.InputJsonValue;
    },
    prisma: DbClient
  ) {
    return prisma.transcriptJob.update({
      where: { id: jobId },
      data: update,
    });
  }

  static async UpdateTranscriptJobForTenant(
    schemaName: string,
    jobId: string,
    update: {
      status?: TranscriptJobStatus;
      result?: Prisma.InputJsonValue;
    }
  ) {
    return this.UpdateTranscriptJob(jobId, update, GetTenantClient(schemaName));
  }

  static async CheckStudentTranscriptStatus(
    jobId: string,
    prisma: DbClient
  ) {
    return prisma.transcriptJob.findFirst({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        facultyId: true,
        semesterId: true,
        result: true,
      }
    });
  }
}
