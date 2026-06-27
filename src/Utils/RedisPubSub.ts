import Redis from "ioredis";
import { RedisOptions } from "ioredis";
import { EventEmitter } from "events";
import { logger } from "./Logger";
import dotenv from 'dotenv';
import { getRedisLogTarget, getRedisUrlOrOptions } from "./RedisConfig";
import { UseMemoryQueue } from "./QueueDriver";
dotenv.config();

const MemoryPubSub = new EventEmitter();

class MemoryRedisPubSub extends EventEmitter {
  async publish(channel: string, message: string): Promise<number> {
    queueMicrotask(() => MemoryPubSub.emit("message", channel, message));
    return MemoryPubSub.listenerCount("message");
  }

  async subscribe(_channel: string): Promise<number> {
    return 1;
  }

  async quit(): Promise<"OK"> {
    this.removeAllListeners();
    return "OK";
  }

  override on(event: "message", listener: (channel: string, message: string) => void): this;
  override on(event: string | symbol, listener: (...args: any[]) => void): this {
    if (event === "message") {
      MemoryPubSub.on("message", listener);
      return super.on(event, listener);
    }

    return super.on(event, listener);
  }
}

const sharedOptions: RedisOptions = {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  reconnectOnError: (err) => {
    logger.warn({ message: "Redis reconnect attempt", error: err.message });
    return true;
  },
};

function createRedisClient(): Redis {
  const redisConfig = getRedisUrlOrOptions(sharedOptions);

  if (typeof redisConfig === "string") {
    return new Redis(redisConfig, sharedOptions);
  }

  return new Redis(redisConfig);
}

const REDIS_LOG_TARGET = UseMemoryQueue() ? "memory" : getRedisLogTarget();

export const RedisPublisher = UseMemoryQueue()
  ? new MemoryRedisPubSub()
  : createRedisClient();

export const RedisSubscriber = UseMemoryQueue()
  ? new MemoryRedisPubSub()
  : createRedisClient();

(RedisPublisher as any).on("connect", () =>
  logger.info({ message: "Redis Publisher connected", target: REDIS_LOG_TARGET })
);

(RedisPublisher as any).on("error", (err: Error) =>
  logger.error({ message: "Redis Publisher error", err })
);

(RedisSubscriber as any).on("connect", () =>
  logger.info({ message: "Redis Subscriber connected", target: REDIS_LOG_TARGET })
);

(RedisSubscriber as any).on("error", (err: Error) =>
  logger.error({ message: "Redis Subscriber error", err })
);
