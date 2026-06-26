import { Job } from "bullmq";
import { Prisma, TranscriptJobStatus } from "@prisma/client";
import { GetWorkerSingleton } from "../../Utils/BullMQConfig";
import { Queues } from "../../Enums/Queues";
import { TranscriptJobMessage } from "../../Interfaces/Transcript/TranscriptJobMessage";
import { logger } from "../../Utils/Logger";
import { JobRepository } from "../../Repositories/JobRepository";
import { TranscriptService } from "../../Services/TranscriptService";

const ToJSON = (val: unknown): Prisma.InputJsonValue =>
  val as unknown as Prisma.InputJsonValue;

async function Handler(job: Job<TranscriptJobMessage>) {
  const { jobId, semesterId, facultyId, schemaName } = job.data;

  await JobRepository.UpdateTranscriptJobForTenant(
    schemaName,
    jobId,
    { status: TranscriptJobStatus.Processing }
  );

  let studentIds: number[] = [];

  try {
    studentIds = await TranscriptService.GetFacultySemesterStudentIds(
      semesterId,
      facultyId,
      schemaName
    );

    const items = await Promise.all(
      studentIds.map(async (studentId) => {
        try {
          const transcript = await TranscriptService.GenerateStudentTranscript(
            studentId,
            semesterId,
            schemaName
          );

          return {
            studentId,
            semesterId,
            transcript,
          };
        } catch (err: any) {
          return {
            studentId,
            semesterId,
            error: err?.message ?? "Internal system error",
          };
        }
      })
    );

    const failedCount = items.filter((item) => "error" in item).length;
    const status =
      failedCount === 0
        ? TranscriptJobStatus.Completed
        : failedCount === items.length
        ? TranscriptJobStatus.Failed
        : TranscriptJobStatus.Partial_failure;

    await JobRepository.UpdateTranscriptJobForTenant(
      schemaName,
      jobId,
      {
        status,
        result: ToJSON({
          facultyId,
          semesterId,
          totalStudents: items.length,
          completedCount: items.length - failedCount,
          failedCount,
          items,
        }),
      }
    );


    logger.info({
      action: "TranscriptWorker",
      status: "Completed",
      jobId,
      studentIdsCount: studentIds.length,
      semesterId,
      schemaName,
    });
  } catch (err: any) {
    logger.error({
      action: "TranscriptWorker",
      status: "Failed",
      jobId,
      studentIdsCount: studentIds.length,
      semesterId,
      schemaName,
      reason: err?.message,
    });

    await JobRepository.UpdateTranscriptJobForTenant(
      schemaName,
      jobId,
      {
        status: TranscriptJobStatus.Failed,
        result: ToJSON({
          facultyId,
          semesterId,
          error: err?.message ?? "Internal system error",
        }),
      }
    );
  }
}

GetWorkerSingleton<TranscriptJobMessage>(Queues.TranscriptGeneration, Handler);

process.title = "Transcript Worker";

logger.info({
  message: "Transcript Worker started....",
  processId: process.pid,
  processName: process.title,
});
