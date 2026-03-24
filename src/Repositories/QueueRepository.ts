import { Job } from 'bullmq';
import { GetQueue, GetWorkerSingleton } from '../Utils/BullMQConfig';

export class QueueRepository {
  static async Publish<T>(queueName: string, payload: T): Promise<string> {
    const queue = GetQueue(queueName);
    const job = await queue.add(queueName, payload, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 }
    });
    return job.id!;
  }

  static GetWorker<T>(
    queueName: string,
    handler: (job: Job<T>) => Promise<void>
  ) {
    return GetWorkerSingleton<T>(queueName, handler);
  }
}