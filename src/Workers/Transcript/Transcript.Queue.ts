import { Queues } from "../../Enums/Queues";
import { TranscriptJobMessage } from "../../Interfaces/Transcript/TranscriptJobMessage";
import { QueueRepository } from "../../Repositories/QueueRepository";

export async function QueueTranscriptGenerationJob(payload: TranscriptJobMessage) {
  await QueueRepository.Publish<TranscriptJobMessage>(
    Queues.TranscriptGeneration,
    payload
  );
}
