import { randomUUID } from "crypto";
import { JobStatus, Prisma, PrismaClient } from "@prisma/client";


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
}