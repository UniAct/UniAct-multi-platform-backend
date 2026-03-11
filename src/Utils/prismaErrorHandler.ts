import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "../Types/Errors";

//this function is used to handle any catch part instead of handling each error individually in each catch statment 

//NEED TO KNOW (prisma errors has buitlin error codes the one we are gonna use are P2002 and P2025)
  //P2002 is thrown if there is a unique constraint fails e.g (creating a new user with same national ID (national ID must be Unique))
  //P2025 is thrown incase of resource not found e.g (delete user where National Id = x and there is no user found with this National Id)

//primsa error object has this structure 
  /*
  {
  "code": "P2002",
  "clientVersion": "...",
  "meta": {
    "target": ["email"] (which field failed)
  }
}
  */

export function handlePrismaError(err: any, res: Response) {
    
   //unique constraint failed
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {

    // Extract which field failed
    const targetFields = err.meta?.target;
    let message = "Unique constraint failed."; //default message

    if (Array.isArray(targetFields) && targetFields.length > 0) {
      // extract faild fields , Example: ["name"] or ["name","email"]

      message = `${targetFields.join(", ")} already exists.`; //e.g (name already exists) OR (name, email already exists);

    }
    //throw new ConflictError(message);
    
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: JSendStatus.FAIL,
      data: { message },
    });
  }

  // Not found (findUniqueOrThrow / delete when record doesn't exist)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {

    // Try to include context if available
    const model = err.meta?.model ?? "Resource"; //same idea as meta.target above 
    
    //throw new NotFoundError(`${model} is not found`)
    return res.status(StatusCodes.NOT_FOUND).json({
      status: JSendStatus.FAIL,
      data: { message: `${model} not found.` },
    });
  }
  
  // Fallback
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: JSendStatus.ERROR,
    message: err.message || "Internal Server Error",
  });
}
