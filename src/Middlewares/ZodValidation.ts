import { z } from "zod/v4";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";

// @usage
// ZodValidator([
//   [UserIdParamSchema, "params"],
//   [UserBodySchema,    "body"],
// ])

type RequestLocation = "body" | "params" | "query";
type SchemaLocationPair = [z.ZodType, RequestLocation];

export const ZodValidator =
  (schemaLocationPairs: SchemaLocationPair[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    for (const [schema, location] of schemaLocationPairs) {
      const validationResult = schema.safeParse(req[location]);

      if (!validationResult.success) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          status: JSendStatus.FAIL,
          data: z.flattenError(validationResult.error).fieldErrors,
        });
      }

      if (location === "params" || location === "query") {
        Object.assign(req.params, validationResult.data);
      } else {
        req[location] = validationResult.data;
      }
    }

    next();
  };