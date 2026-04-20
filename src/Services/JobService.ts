import { GetTenantClient } from "../Utils/prismaClient";
import { JobRepository } from "../Repositories/JobRepository";
import { NotFoundError } from "../Types/Errors";
import { FormatStudentImportJobResponse } from "../Interfaces/Jobs/GetStudentImportStatus/Mapper";
import { FormatStudentEnrollmentJobResponse } from "../Interfaces/Jobs/StudentEnrollment/Mapper";

export class JobService {

  static async CheckStudentImportStatus(jobId: string, schemaName: string) {
    const prisma = GetTenantClient(schemaName);
    const job = await JobRepository.CheckStudentImportStatus(jobId, prisma);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    return FormatStudentImportJobResponse(job);
  }

  static async CheckStudentEnrollmentStatus(jobId: string, schemaName: string) {
    const prisma = GetTenantClient(schemaName);
    const job = await JobRepository.CheckStudentEnrollmentStatus(jobId, prisma);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    return FormatStudentEnrollmentJobResponse(job);
  }
}