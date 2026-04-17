import Redis from "ioredis";
import { logger } from "./Logger";
import dotenv from 'dotenv';
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

export const RedisPublisher = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  reconnectOnError: (err) => {
    logger.warn({ message: "Redis reconnect attempt", error: err.message });
    return true;
  },
});

export const RedisSubscriber = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  reconnectOnError: (err) => {
    logger.warn({ message: "Redis reconnect attempt", error: err.message });
    return true;
  },
});

RedisPublisher.on("connect", () =>
  logger.info({ message: "Redis Publisher connected", url: REDIS_URL })
);

RedisPublisher.on("error", (err) =>
  logger.error({ message: "Redis Publisher error", err })
);

RedisSubscriber.on("connect", () =>
  logger.info({ message: "Redis Subscriber connected", url: REDIS_URL })
);

RedisSubscriber.on("error", (err) =>
  logger.error({ message: "Redis Subscriber error", err })
);