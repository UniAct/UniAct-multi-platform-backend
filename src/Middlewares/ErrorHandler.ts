import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../Types/Errors";
import JSendStatus from "../Enums/Jsend";
import { handlePrismaError } from "../Utils/prismaErrorHandler";
import { StatusCodes } from "http-status-codes";


export function ErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {

  // Custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: JSendStatus.FAIL,
      message: err.message,
    });
  }

  // Prisma unique constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError){
      return handlePrismaError(err,res)
  }

  // fallback
   return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: JSendStatus.ERROR,
      message: err.message || "Internal Server Error",
   });
}

//This wrapper forwards async errors to Express's error middleware automatically without the need for repeating try{}catc{} every wehere on each function
export const asyncHandler =
  (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
