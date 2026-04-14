import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "../Types/Errors";
import { PrismaErrorCode } from "../Enums/PrismaErrorCode";

//this function is used to handle any catch part instead of handling each error individually in each catch statment 

//NEED TO KNOW (prisma errors has buitlin error codes the one we are gonna use are P2002 and P2025)
  //P2002 is thrown if there is a unique constraint fails e.g (creating a new user with same national ID (national ID must be Unique))
  //P2025 is thrown incase of resource not found e.g (delete user where National Id = x and there is no user found with this National Id)

export function handlePrismaError(err: any, res: Response) {

  // Extract which field failed
    const adapterError = err.meta?.driverAdapterError as any;

    const fields :string[] |undefined = adapterError?.cause?.constraint?.fields ?? err.meta?.target ;
    
   //unique constraint failed
  if (err.code === PrismaErrorCode.UniqueConstraint) {

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
  if (err.code === PrismaErrorCode.NotFound) {
     console.dir(err, { depth: null, colors: true });
    // Many P2025 errors don’t include specific field names,
    // so show model name or generic resource name
    const model = err.meta?.modelName ?? "Resource";

    const message = `${model} not found.`;

    return res.status(StatusCodes.NOT_FOUND).json({
      status: JSendStatus.FAIL,
      data: { message },
    });
  }

 if (err.code === PrismaErrorCode.ForeignKeyConstraint) {
  const rawConstraint = err.meta?.driverAdapterError?.cause?.constraint?.index || "";
  const model = err.meta?.modelName || "";

  // 1. Start with the raw string: "ClassSession_program_id_fkey"
  let entityName = rawConstraint
    .replace(`${model}_`, "")    // -> "program_id_fkey"
    .replace("_fkey", "")        // -> "program_id"
    .replace(/_?id/i, "")        // -> "program" (removes _id or Id case-insensitively)
    .replace(/_/g, " ")          // -> "program"
    .trim();

  // 2. Capitalize the first letter: "program" -> "Program"
  if (entityName) {
    entityName = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  } else {
    entityName = "Related record";
  }

  // 3. Craft a friendly message
  // Example: "The selected Program does not exist."
  const message = `The selected ${entityName} does not exist.`;

  return res.status(StatusCodes.BAD_REQUEST).json({
    status: JSendStatus.FAIL,
    data: { message },
  });
}

  const cause = err.meta?.driverAdapterError?.cause || err.cause;
  const errorCode = cause?.originalCode || cause?.code
  
  if(errorCode === "23P01"){
    const constraintName = cause?.constraint || cause?.message?.match(/"(.+?)"/)?.[1] || "";

    let message:string = "Error";
    if(constraintName === "no_teacher_overlap"){
      message = "The selected teacher is already booked for another session at this time."
    }
    else if(constraintName === "no_classroom_overlap"){
      message = "The selected classroom is already occupied by another session at this time."
    }
    return res.status(StatusCodes.CONFLICT).json({
      status:JSendStatus.FAIL,
      data: {message}
    })
  }



  // Fallback
  console.log("--------------------------------")
  console.dir(err, { depth: null, colors: true });
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: JSendStatus.ERROR,
    message: err.message || "Internal Server Error",
  });
}
