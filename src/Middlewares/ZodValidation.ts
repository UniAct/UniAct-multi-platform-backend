import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

type RequestLocation = "body" | "params" | "query" | "headers";
type SchemaMap = Partial<Record<RequestLocation, z.ZodType>>;

function flattenZodErrors(issues: z.core.$ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of issues) {
    const path = issue.path
      .map((segment, index) =>
        typeof segment === "number"
          ? `[${segment}]`
          : index === 0
            ? String(segment)
            : `.${String(segment)}`
      )
      .join("");

    const field = path || "value";

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export const ZodValidator = (schemas: SchemaMap): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    makeQueryWritable(req);
    const errors: Record<string, Record<string, string>> = {};

    for (const key of Object.keys(schemas) as RequestLocation[]) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);

      if (!result.success) {
        errors[key] = flattenZodErrors(result.error.issues);
        continue;
      }

      req[key] = result.data;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        status: "fail",
        data:   errors,
      });
    }

    next();
  };
};

function makeQueryWritable(req: Request) {
  Object.defineProperty(req, "query", {
    ...Object.getOwnPropertyDescriptor(req, "query"),
    value:    req.query,
    writable: true,
  });
}