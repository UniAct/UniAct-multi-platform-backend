import { Queue, Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import { logger } from './Logger';
dotenv.config();

const queues: Record<string, Queue> = {};
const workers: Record<string, Worker> = {};

export const RedisConnection = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!),
};

export function GetQueue(queueName: string): Queue {
  if (!queues[queueName]) {
    queues[queueName] = new Queue(queueName, { connection: RedisConnection });
  }
  return queues[queueName];
}

export function GetWorkerSingleton<T>(
  queueName: string,
  handler: (job: Job<T>) => Promise<void>
): Worker {
  if (workers[queueName]) {
    throw new Error(`Worker for queue "${queueName}" is already registered`);
  }

  const worker = new Worker<T>(queueName, handler, { connection: RedisConnection });

  worker.on('completed', (job) => {
    logger.info({ action: 'Worker', status: 'Completed', jobId: job.id, queue: queueName });
  });

  worker.on('failed', (job, err) => {
    logger.error({ action: 'Worker', status: 'Failed', jobId: job?.id, queue: queueName, reason: err.message });
  });

  workers[queueName] = worker;
  return workers[queueName];
}

export async function CloseAllQueuesAndWorkers(): Promise<void> {
  for (const queue of Object.values(queues)) await queue.close();
  for (const worker of Object.values(workers)) await worker.close();
}