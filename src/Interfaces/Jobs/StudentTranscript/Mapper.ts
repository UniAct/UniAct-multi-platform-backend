import { TranscriptJobStatus } from "@prisma/client";
import { JobRepository } from "../../../Repositories/JobRepository";

export function FormatStudentTranscriptJobResponse(
  job: NonNullable<Awaited<ReturnType<typeof JobRepository.CheckStudentTranscriptStatus>>>
) {
  const { id, status, facultyId, semesterId, result } = job;
  const parsedResult = result ? (result as any) : null;

  const items = parsedResult?.items ?? null;
  const hasError =
    !!parsedResult?.error || (Array.isArray(items) ? items.some((i: any) => !!i?.error) : false);

  return {
    jobId: id,
    status: status as TranscriptJobStatus,
    facultyId,
    semesterId,
    result: parsedResult,
    items,
    isCompleted:
      status === TranscriptJobStatus.Completed ||
      status === TranscriptJobStatus.Failed ||
      status === TranscriptJobStatus.Partial_failure,
    hasError,
  };
}
