import { GetTenantClient } from "../Utils/prismaClient";
import { JobRepository } from "../Repositories/JobRepository";
import { NotFoundError } from "../Types/Errors";
import { FormatJobResponse } from "../Interfaces/Jobs/GetStudentImportStatus/Mapper";

export class JobService {

  static async CheckStudentImportStatus(jobId: string, schemaName: string) {
    const prisma = GetTenantClient(schemaName);
    const job = await JobRepository.CheckStudentImportStatus(jobId, prisma);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    return FormatJobResponse(job);
  }
}