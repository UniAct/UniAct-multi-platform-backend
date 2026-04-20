import { JobStatus } from "@prisma/client";
import { JobRepository } from "../../../Repositories/JobRepository";

export function FormatStudentImportJobResponse(job: NonNullable<Awaited<ReturnType<typeof JobRepository.CheckStudentImportStatus>>>) {
    const totalRows =
      (job.inserted_rows ?? 0) + (job.failed_rows ?? 0);

    const base = {
      status:     job.status,
    };

    switch (job.status) {
      case JobStatus.Pending:
        return {
          ...base,
          message: "Your import job is queued and will begin shortly.",
        };

      case JobStatus.Processing:
        return {
          ...base,
          message: "Your import is currently being processed. This may take a few moments.",
        };

      case JobStatus.Completed:
        return {
          ...base,
          message: `Import completed successfully. All ${totalRows} students were imported.`,
        };

      case JobStatus.CompletedWithErrors:
        return {
          ...base,
          message: `Import finished with issues. ${job.inserted_rows} of ${totalRows} students were imported. Review the errors below.`,
          error: job.error_log
        };

      case JobStatus.Failed:
        return {
          ...base,
          message: "Import failed before any students could be inserted. See the error details below.",
          error: job.error_log
        };
    }
  }