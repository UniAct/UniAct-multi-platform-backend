import { RedisOptions } from "ioredis";

function requireRedisUrlInHostedRuntime(): string | undefined {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    return redisUrl;
  }

  if (process.env.RENDER) {
    throw new Error(
      "REDIS_URL must be set on Render. Create a Render Key Value instance and set REDIS_URL to its internal Redis URL."
    );
  }

  return undefined;
}

export function getRedisLogTarget(): string {
  const redisUrl = requireRedisUrlInHostedRuntime();

  if (redisUrl) {
    return new URL(redisUrl).host;
  }

  return `${process.env.REDIS_HOST || "127.0.0.1"}:${process.env.REDIS_PORT || "6379"}`;
}

export function getRedisConnectionOptions(baseOptions: RedisOptions = {}): RedisOptions {
  const redisUrl = requireRedisUrlInHostedRuntime();

  if (!redisUrl) {
    return {
      ...baseOptions,
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: getRedisPort(process.env.REDIS_PORT || "6379"),
    };
  }

  const url = new URL(redisUrl);
  const connection: RedisOptions = {
    ...baseOptions,
    host: url.hostname,
    port: getRedisPort(url.port || "6379"),
  };

  if (url.username) connection.username = decodeURIComponent(url.username);
  if (url.password) connection.password = decodeURIComponent(url.password);
  if (url.protocol === "rediss:") connection.tls = {};
  if (url.pathname.length > 1) connection.db = getRedisDb(url.pathname.slice(1));

  return connection;
}

export function getRedisUrlOrOptions(baseOptions: RedisOptions = {}): string | RedisOptions {
  const redisUrl = requireRedisUrlInHostedRuntime();

  if (redisUrl) {
    return redisUrl;
  }

  return getRedisConnectionOptions(baseOptions);
}

function getRedisPort(portValue: string): number {
  const port = Number(portValue);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("REDIS_PORT must be a valid positive integer");
  }

  return port;
}

function getRedisDb(dbValue: string): number {
  const db = Number(dbValue);

  if (!Number.isInteger(db) || db < 0) {
    throw new Error("Redis database index in REDIS_URL must be a valid non-negative integer");
  }

  return db;
}
