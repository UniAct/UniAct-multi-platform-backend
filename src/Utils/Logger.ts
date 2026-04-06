import pinoHttp from "pino-http";
import pino from "pino";

// Recommended structured logging pattern (standardized format):
/*
  Minimal info: action and status
  logger.info({
    action: "ClassName.MethodName",   // e.g., "FacultyController.CreateFaculty"
    status: "success",                // success
    schema: req.schema_name,          // tenant or schema identifier (if multi-tenant)
  });

  Example for warnings (failed operation but expected)
  logger.warn({
    action: "UserController.Login",
    status: "failed",
    schema: req.schema_name,
    reason: "invalid credentials"     // human-readable reason or failure type
  });

  Example for errors (unexpected exceptions)
  logger.error({
    action: "UniversityController.CreateTenant",
    status: "failed",
    schema: tenantSchema,
    err: error                        // full error object for debugging
  });

  Optional additional fields for richer context:
  userId, entity, entityId, entityName, ip, requestId, etc.

  you can also follow the same structure for req.Log type that pinoHttp provide
*/

const isDev = process.env.NODE_ENV !== "Production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  transport: isDev
    ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss.l Z",
        ignore: "pid,hostname",
      },
    }
    : undefined,
  redact: {
    paths: [
      "req.headers.authorization",
      "password",
      "token",
    ],
    censor: "[REDACTED]",
  },

  timestamp: pino.stdTimeFunctions.isoTime,
});


export const httpLogger = pinoHttp({
  logger,
  autoLogging: false,

  customLogLevel: (_req: any, res: any, err: any) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  customSuccessMessage: (req: any, _res: any) => {
    return `${req.method} ${req.url} completed`;
  },

  customErrorMessage: (req: any, _res: any, _err: any) => {
    return `${req.method} ${req.url} failed`;
  },
});
