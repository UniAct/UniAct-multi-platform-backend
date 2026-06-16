import { Job } from "bullmq";
import { GetWorkerSingleton } from "../../Utils/BullMQConfig";
import { Queues } from "../../Enums/Queues";
import { TranscriptJobMessage } from "../../Interfaces/Transcript/TranscriptJobMessage";
import { TranscriptService } from "../../Services/TranscriptService";
import { logger } from "../../Utils/Logger";

async function Handler(job: Job<TranscriptJobMessage>) {
  const { studentId, semesterId, schemaName } = job.data;

  try {
    await TranscriptService.GenerateStudentTranscript(studentId, semesterId, schemaName);
    logger.info({ action: "TranscriptWorker", status: "Completed", studentId, semesterId, schemaName });
  } catch (err: any) {
    logger.error({ action: "TranscriptWorker", status: "Failed", studentId, semesterId, schemaName, reason: err?.message });
    throw err;
  }
}

GetWorkerSingleton<TranscriptJobMessage>(Queues.TranscriptGeneration, Handler);

process.title = "Transcript Worker";

logger.info({
  message: "Transcript Worker started....",
  processId: process.pid,
  processName: process.title,
});
