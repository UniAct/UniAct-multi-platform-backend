import { randomUUID } from "crypto";
import { logger } from "./Logger";

type JobHandler<T> = (job: { id: string; data: T }) => Promise<void>;

interface MemoryJob<T> {
  id: string;
  data: T;
  attemptsLeft: number;
  backoffMs: number;
}

interface MemoryQueueState {
  jobs: MemoryJob<unknown>[];
  active: number;
  concurrency: number;
  handler?: JobHandler<unknown>;
}

const queues = new Map<string, MemoryQueueState>();

function getState(queueName: string): MemoryQueueState {
  let state = queues.get(queueName);

  if (!state) {
    state = {
      jobs: [],
      active: 0,
      concurrency: Number(process.env.MEMORY_QUEUE_CONCURRENCY || 5),
    };
    queues.set(queueName, state);
  }

  return state;
}

export async function PublishMemoryJob<T>(queueName: string, data: T): Promise<string> {
  const state = getState(queueName);
  const id = randomUUID();

  state.jobs.push({
    id,
    data,
    attemptsLeft: Number(process.env.MEMORY_QUEUE_ATTEMPTS || 3),
    backoffMs: Number(process.env.MEMORY_QUEUE_BACKOFF_MS || 5000),
  });

  queueMicrotask(() => drainQueue(queueName));
  return id;
}

export function RegisterMemoryWorker<T>(queueName: string, handler: JobHandler<T>) {
  const state = getState(queueName);

  if (state.handler) {
    throw new Error(`Worker for queue "${queueName}" is already registered`);
  }

  state.handler = handler as JobHandler<unknown>;
  queueMicrotask(() => drainQueue(queueName));

  return {
    async close() {
      state.handler = undefined;
    },
  };
}

function drainQueue(queueName: string): void {
  const state = getState(queueName);

  while (state.handler && state.active < state.concurrency && state.jobs.length > 0) {
    const job = state.jobs.shift()!;
    state.active++;

    void runJob(queueName, state, job);
  }
}

async function runJob(queueName: string, state: MemoryQueueState, job: MemoryJob<unknown>): Promise<void> {
  try {
    await state.handler!({ id: job.id, data: job.data });
    logger.info({
      action: "MemoryQueue",
      status: "Completed",
      queue: queueName,
      jobId: job.id,
    });
  } catch (err: any) {
    job.attemptsLeft--;

    logger.error({
      action: "MemoryQueue",
      status: job.attemptsLeft > 0 ? "Retrying" : "Failed",
      queue: queueName,
      jobId: job.id,
      reason: err?.message,
    });

    if (job.attemptsLeft > 0) {
      setTimeout(() => {
        state.jobs.push(job);
        drainQueue(queueName);
      }, job.backoffMs);
    }
  } finally {
    state.active--;
    drainQueue(queueName);
  }
}
