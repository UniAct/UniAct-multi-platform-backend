import { StatusCodes } from "http-status-codes";
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class ConflictError extends AppError{
   constructor(message="Resource already exists"){
      super(message,StatusCodes.CONFLICT)
   }
}

export class ConnectionError extends AppError{
   constructor(message="Connection With The Resource Was Failed"){
      super(message,StatusCodes.CONFLICT)
   }
}