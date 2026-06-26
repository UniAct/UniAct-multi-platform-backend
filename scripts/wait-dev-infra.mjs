import { spawnSync } from "node:child_process";

const redisPort = process.env.REDIS_PORT || "16379";
const minioPort = process.env.MINIO_PORT || "9000";

const result = spawnSync(
  "npx",
  ["wait-on", `tcp:127.0.0.1:${redisPort}`, `tcp:127.0.0.1:${minioPort}`],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  }
);

process.exit(result.status ?? 1);
