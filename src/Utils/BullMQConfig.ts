import { Queue, Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import { logger } from './Logger';
dotenv.config();

/**
 * BullMQ Queue & Worker Infrastructure Layer
 * ------------------------------------------------------------
 *
 * This module provides a centralized abstraction for managing:
 * - Redis connection configuration
 * - BullMQ Queue instances (producer side)
 * - BullMQ Worker instances (consumer side)
 * - Singleton enforcement for workers per queue
 * - Graceful shutdown of all queues and workers
 *
 * ------------------------------------------------------------
 * ARCHITECTURE OVERVIEW
 * ------------------------------------------------------------
 *
 * - Each queue name maps to a single shared Queue instance (in-process cache)
 * - Each queue name maps to exactly ONE Worker instance per process
 * - Multiple container instances are allowed (horizontal scaling)
 * - Redis acts as the coordination layer between workers
 *
 * ------------------------------------------------------------
 * DISTRIBUTED EXECUTION MODEL
 * ------------------------------------------------------------
 *
 * If you run multiple containers (e.g. 3 instances):
 *
 * - Each container creates its own Worker
 * - All workers listen to the same Redis queue
 * - Jobs are distributed automatically by Redis locks
 *
 * Result:
 * - Each job is processed by exactly ONE worker instance
 * - Workers compete for jobs (competing consumers model)
 * - Load is balanced across instances
 *
 * ------------------------------------------------------------
 * CONCURRENCY MODEL
 * ------------------------------------------------------------
 *
 * Inside each worker instance:
 * - concurrency: 5
 *
 * Meaning:
 * - Each worker can process up to 5 jobs in parallel
 * - Total system throughput scales with:
 *      instances × concurrency
 *
 * Example:
 * - 3 containers × 5 concurrency = 15 parallel jobs
 *
 * ------------------------------------------------------------
 * RATE LIMITING
 * ------------------------------------------------------------
 *
 * limiter:
 * - max: 100 jobs
 * - duration: 1000ms
 *
 * This enforces a global processing cap per worker instance:
 * - Prevents Redis / DB overload spikes
 * - Smooths traffic bursts
 *
 * ------------------------------------------------------------
 * RELIABILITY GUARANTEE (BullMQ)
 * ------------------------------------------------------------
 *
 * - Jobs are processed at-least-once
 * - A job is locked per worker during execution
 * - If a worker crashes, the job is retried
 *
 * ------------------------------------------------------------
 * SINGLETON BEHAVIOR
 * ------------------------------------------------------------
 *
 * - Each queue name can only have ONE worker per process
 * - Prevents accidental duplicate consumers in same container
 *
 * ------------------------------------------------------------
 * SHUTDOWN BEHAVIOR
 * ------------------------------------------------------------
 *
 * CloseAllQueuesAndWorkers():
 * - Closes all active workers
 * - Closes all queue connections
 * - Used during graceful shutdown (Docker / PM2 / Kubernetes)
 *
 */

const queues: Record<string, Queue> = {};
const workers: Record<string, Worker> = {};

function getRedisPort(): number {
  const port = Number(process.env.REDIS_PORT || 6379);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("REDIS_PORT must be a valid positive integer");
  }

  return port;
}

function getRedisHost(): string {
  const host = process.env.REDIS_HOST || "127.0.0.1";

  if (host === "localhost") {
    return "127.0.0.1";
  }

  return host;
}

export const RedisConnection = {
  host: getRedisHost(),
  port: getRedisPort(),
  family: 4,
  connectTimeout: 10000,
  keepAlive: 30000,
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    return Math.min(times * 100, 3000);
  },
};

// ─────────────────────────────────────────────
// Queue
// ─────────────────────────────────────────────
export function GetQueue(queueName: string): Queue {
  if (!queues[queueName]) {
    queues[queueName] = new Queue(queueName, {
      connection: RedisConnection,
    });

    queues[queueName].on("error", (err) => {
      logger.error({
        action: "Queue",
        status: "Error",
        queue: queueName,
        reason: err.message,
        code: (err as NodeJS.ErrnoException).code,
      });
    });
  }
  return queues[queueName];
}

// ─────────────────────────────────────────────
// Worker (Concurrent)
// ─────────────────────────────────────────────
export function GetWorkerSingleton<T>(
  queueName: string,
  handler: (job: Job<T>) => Promise<void>
): Worker {
  if (workers[queueName]) {
    throw new Error(`Worker for queue "${queueName}" is already registered`);
  }

  const worker = new Worker<T>(queueName, handler, {
    connection: RedisConnection,

    concurrency: 5,

    limiter: {
      max: 100,
      duration: 1000,
    },
  });

  worker.on('completed', (job) => {
    logger.info({
      action: 'Worker',
      status: 'Completed',
      jobId: job.id,
      queue: queueName,
    });
  });

  worker.on('failed', (job, err) => {
    logger.error({
      action: 'Worker',
      status: 'Failed',
      jobId: job?.id,
      queue: queueName,
      reason: err.message,
    });
  });

  worker.on("error", (err) => {
    logger.error({
      action: "Worker",
      status: "Error",
      queue: queueName,
      reason: err.message,
      code: (err as NodeJS.ErrnoException).code,
    });
  });

  workers[queueName] = worker;
  return worker;
}

export async function CloseAllQueuesAndWorkers(): Promise<void> {
  for (const worker of Object.values(workers)) {
    await worker.close();
  }

  for (const queue of Object.values(queues)) {
    await queue.close();
  }
}
