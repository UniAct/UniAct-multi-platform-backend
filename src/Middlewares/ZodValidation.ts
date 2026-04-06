import { Request, Response, NextFunction, RequestHandler } from "express";
import { z, ZodTypeAny } from "zod";
import { StatusCodes } from "http-status-codes";


// What parts of the request we support
type RequestLocation = "body" | "params" | "query" | "headers";

// Schema map instead of array (cleaner DX)
type SchemaMap = Partial<Record<RequestLocation, ZodTypeAny>>;

export const ZodValidator = (schemas: SchemaMap): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    makeQueryWritable(req);
    const errors: Record<string, any> = {};


    for (const key of Object.keys(schemas) as RequestLocation[]) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);

      if (!result.success) {
        errors[key] = z.flattenError(result.error).fieldErrors;
        continue;
      }

      req[key] = result.data;
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

function makeQueryWritable(req:Request){
Object.defineProperty(req, 'query', { ...Object.getOwnPropertyDescriptor(req, 'query'), value: req.query, writable: true });
}