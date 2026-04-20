import { JobRepository } from "../../../Repositories/JobRepository";
import { EnrollmentJobStatus } from "@prisma/client";

export function FormatStudentEnrollmentJobResponse(
  job: NonNullable<Awaited<ReturnType<typeof JobRepository.CheckStudentEnrollmentStatus>>>
) {
  const { id, status, studentId, result } = job;

  const parsedResult = result ? (result as any) : null;

  return {
    jobId: id,
    status: status as EnrollmentJobStatus,
    studentId,
    result: parsedResult,
    isCompleted: status === EnrollmentJobStatus.Done,
    hasError: !!parsedResult?.error,
  };
}