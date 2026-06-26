import { spawnSync } from "node:child_process";

function run(command, args) {
  return spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

const dockerCheck = run("docker", ["version"]);

if (dockerCheck.status !== 0) {
  console.error("\nDocker is not available. Start Docker Desktop, then run `npm run dev` again.");
  console.error("If Redis and MinIO are already running elsewhere, use `npm run dev:external-infra`.\n");
  process.exit(dockerCheck.status ?? 1);
}

const compose = run("docker", ["compose", "up", "-d"]);

if (compose.status !== 0) {
  console.error("\nCould not start development infrastructure with Docker Compose.");
  console.error("Check Docker Desktop and docker-compose.yml, then retry `npm run dev`.\n");
  process.exit(compose.status ?? 1);
}
