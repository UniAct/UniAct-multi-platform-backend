import Redis from "ioredis";
import { RedisOptions } from "ioredis";
import { logger } from "./Logger";
import dotenv from 'dotenv';
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const REDIS_URL = process.env.REDIS_URL;

const sharedOptions: RedisOptions = {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  reconnectOnError: (err) => {
    logger.warn({ message: "Redis reconnect attempt", error: err.message });
    return true;
  },
};

function createRedisClient(): Redis {
  if (REDIS_URL) {
    return new Redis(REDIS_URL, sharedOptions);
  }

  return new Redis({
    ...sharedOptions,
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
}

const REDIS_LOG_TARGET = REDIS_URL ? new URL(REDIS_URL).host : `${REDIS_HOST}:${REDIS_PORT}`;

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
