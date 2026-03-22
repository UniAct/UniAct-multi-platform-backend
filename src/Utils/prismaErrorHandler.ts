import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "../Types/Errors";

//this function is used to handle any catch part instead of handling each error individually in each catch statment 

//NEED TO KNOW (prisma errors has buitlin error codes the one we are gonna use are P2002 and P2025)
  //P2002 is thrown if there is a unique constraint fails e.g (creating a new user with same national ID (national ID must be Unique))
  //P2025 is thrown incase of resource not found e.g (delete user where National Id = x and there is no user found with this National Id)

export function handlePrismaError(err: any, res: Response) {

  // Extract which field failed
    const adapterError = err.meta?.driverAdapterError as any;

    const fields :string[] |undefined = adapterError?.cause?.constraint?.fields ?? err.meta?.target ;
    
   //unique constraint failed
  if (err.code === "P2002") {

    let message = "Unique constraint failed."; //default message

    if (Array.isArray(fields) && fields.length > 0) {
      // extract faild fields , Example: ["name"] or ["name","email"]

      message = ` ${err.meta?.modelName} with this ${fields.join(", ")} already exists.`; //e.g (name already exists) OR (name, email already exists);

    }
    //throw new ConflictError(message);
    
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: JSendStatus.FAIL,
      data: { message },
    });
  }

  //Not Found (e.g., delete non-existent, findUniqueOrThrow)
  if (err.code === "P2025") {
    // Many P2025 errors don’t include specific field names,
    // so show model name or generic resource name
    const model = err.meta?.modelName ?? "Resource";

    const message = `${model} not found.`;

    return res.status(StatusCodes.NOT_FOUND).json({
      status: JSendStatus.FAIL,
      data: { message },
    });
  }
  
  // Fallback
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: JSendStatus.ERROR,
    message: err.message || "Internal Server Error",
  });
}
