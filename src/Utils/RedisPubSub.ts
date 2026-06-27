import Redis from "ioredis";
import { RedisOptions } from "ioredis";
import { logger } from "./Logger";
import dotenv from 'dotenv';
import { getRedisLogTarget, getRedisUrlOrOptions } from "./RedisConfig";
dotenv.config();

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

const REDIS_LOG_TARGET = getRedisLogTarget();

export const RedisPublisher = createRedisClient();

export const RedisSubscriber = createRedisClient();

RedisPublisher.on("connect", () =>
  logger.info({ message: "Redis Publisher connected", target: REDIS_LOG_TARGET })
);

RedisPublisher.on("error", (err) =>
  logger.error({ message: "Redis Publisher error", err })
);

RedisSubscriber.on("connect", () =>
  logger.info({ message: "Redis Subscriber connected", target: REDIS_LOG_TARGET })
);

RedisSubscriber.on("error", (err) =>
  logger.error({ message: "Redis Subscriber error", err })
);
