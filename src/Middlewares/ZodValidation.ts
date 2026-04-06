import { Request, Response, NextFunction, RequestHandler } from "express";
import { z, ZodTypeAny } from "zod";
import { StatusCodes } from "http-status-codes";


// What parts of the request we support
type RequestLocation = "body" | "params" | "query" | "headers";

type SchemaMap = Partial<Record<RequestLocation, ZodTypeAny>>;
type SchemaLocationPair = [ZodTypeAny, RequestLocation];

const toPairs = (schemas: SchemaMap | SchemaLocationPair[]): SchemaLocationPair[] => {
  if (Array.isArray(schemas)) return schemas;

  return (Object.keys(schemas) as RequestLocation[])
    .map((location) => {
      const schema = schemas[location];
      return schema ? ([schema, location] as SchemaLocationPair) : null;
    })
    .filter((entry): entry is SchemaLocationPair => entry !== null);
};

export const ZodValidator = (schemas: SchemaMap | SchemaLocationPair[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, Record<string, string[] | undefined>> = {};

    for (const [schema, location] of toPairs(schemas)) {
      const result = schema.safeParse(req[location]);

      if (!result.success) {
        errors[location] = z.flattenError(result.error).fieldErrors;
        continue;
      }

      // req.query is getter-only in Express; mutate query/params objects in-place.
      if (location === "params") {
        Object.assign(req.params, result.data as Record<string, unknown>);
      } else if (location === "query") {
        Object.assign(req.query as Record<string, unknown>, result.data as Record<string, unknown>);
      } else if (location === "headers") {
        Object.assign(req.headers as Record<string, unknown>, result.data as Record<string, unknown>);
      } else {
        req.body = result.data;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        status: "fail",
        data: errors,
      });
    }

    next();
  };
};
