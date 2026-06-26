import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { logger } from "./Logger";

let aiProcess: ChildProcessWithoutNullStreams | null = null;

function resolvePythonExecutable(aiRoot: string): string {
  if (process.env.AI_SERVICE_PYTHON) return process.env.AI_SERVICE_PYTHON;

  const venvPython = process.platform === "win32"
    ? path.join(aiRoot, ".venv", "Scripts", "python.exe")
    : path.join(aiRoot, ".venv", "bin", "python");

  return fs.existsSync(venvPython) ? venvPython : "python";
}

function readDatabaseDefaults() {
  const fallback = {
    POSTGRES_USERNAME: "postgres",
    POSTGRES_PASSWORD: "postgres",
    POSTGRES_HOST: "localhost",
    POSTGRES_PORT: "5432",
    POSTGRES_MAIN_DATABASE: "uniAct",
  };

  if (!process.env.DATABASE_URL) return fallback;

  try {
    const url = new URL(process.env.DATABASE_URL);
    return {
      POSTGRES_USERNAME: decodeURIComponent(url.username || fallback.POSTGRES_USERNAME),
      POSTGRES_PASSWORD: decodeURIComponent(url.password || fallback.POSTGRES_PASSWORD),
      POSTGRES_HOST: url.hostname || fallback.POSTGRES_HOST,
      POSTGRES_PORT: url.port || fallback.POSTGRES_PORT,
      POSTGRES_MAIN_DATABASE: url.pathname.replace(/^\//, "") || fallback.POSTGRES_MAIN_DATABASE,
    };
  } catch (error) {
    logger.warn({
      service: "ai",
      err: error,
      message: "Could not parse DATABASE_URL for AI runtime. Falling back to local Postgres defaults.",
    });
    return fallback;
  }
}

function buildAiEnvironment(aiRoot: string): NodeJS.ProcessEnv {
  const dbDefaults = readDatabaseDefaults();
  const vectorPath = path.join(aiRoot, ".data", "qdrant");

  fs.mkdirSync(vectorPath, { recursive: true });

  return {
    APP_NAME: "UniAct AI Assistant",
    APP_VERSION: "0.1.0",
    FILE_ALLOWED_TYPES: JSON.stringify(["application/pdf", "text/plain"]),
    FILE_MAX_SIZE: "52428800",
    FILE_DEFAULT_CHUNCK_SIZE: "1000",
    ...dbDefaults,
    GENERATION_BACKEND: "OPENAI",
    EMBEDDING_BACKEND: "OPENAI",
    GENERATION_MODEL_ID: "gpt-4o-mini",
    EMBEDDING_MODEL_ID: "text-embedding-3-small",
    EMBEDDING_MODEL_SIZE: "1536",
    INPUT_DAFAULT_MAX_CHARACTERS: "100000",
    GENERATION_DAFAULT_MAX_TOKENS: "1000",
    GENERATION_DAFAULT_TEMPERATURE: "0.2",
    VECTOR_DB_BACKEND: "QDRANT",
    VECTOR_DB_PATH: vectorPath,
    VECTOR_DB_DISTANCE_METHOD: "cosine",
    ...process.env,
    PYTHONPATH: path.join(aiRoot, "src"),
  };
}

export function StartAiRuntime(): void {
  const shouldStart = (process.env.AI_SERVICE_AUTO_START ?? "true").toLowerCase() !== "false";
  if (!shouldStart || aiProcess) return;

  const aiRoot = process.env.AI_SERVICE_ROOT
    ? path.resolve(process.env.AI_SERVICE_ROOT)
    : path.resolve(process.cwd(), "..", "AI_FinalProject");

  const port = process.env.AI_SERVICE_PORT ?? "8000";
  const python = resolvePythonExecutable(aiRoot);

  if (!fs.existsSync(aiRoot)) {
    logger.warn({
      service: "ai",
      action: "runtime_skip",
      aiRoot,
      message: "AI service root was not found. Set AI_SERVICE_ROOT or disable AI_SERVICE_AUTO_START.",
    });
    return;
  }

  aiProcess = spawn(
    python,
    ["-m", "uvicorn", "src.main:app", "--host", "127.0.0.1", "--port", port],
    {
      cwd: aiRoot,
      env: buildAiEnvironment(aiRoot),
    }
  );

  aiProcess.stdout.on("data", (data) => {
    logger.info({ service: "ai", output: data.toString().trim() });
  });

  aiProcess.stderr.on("data", (data) => {
    logger.warn({ service: "ai", output: data.toString().trim() });
  });

  aiProcess.on("exit", (code, signal) => {
    logger.warn({ service: "ai", code, signal, message: "AI service exited" });
    aiProcess = null;
  });

  aiProcess.on("error", (error) => {
    logger.error({
      service: "ai",
      err: error,
      message: "AI service could not be started. Check AI_SERVICE_PYTHON and AI_FinalProject dependencies.",
    });
    aiProcess = null;
  });

  logger.info({
    service: "ai",
    action: "runtime_start",
    aiRoot,
    python,
    url: `http://127.0.0.1:${port}`,
  });
}

export function StopAiRuntime(): void {
  if (!aiProcess) return;
  aiProcess.kill();
  aiProcess = null;
}
