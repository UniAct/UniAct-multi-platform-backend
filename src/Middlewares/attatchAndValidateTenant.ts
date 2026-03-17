import { Request, Response, NextFunction } from "express";
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { getTenantClient } from "../Utils/prismaClient";
import { BadRequestError, ForbiddenError, NotFoundError } from "../Types/Errors";

/*
 We have [2] conditions for the request

 [1] if he is a normal user then we have 2 subcategories
  |
  |----> {1}- he already made a request before so we already resolved his tenant, 
  |                we won't have to do anything since req.schema already got the value stored in it 
  |               we MUST NOT resolve tenant on each request
  |               since this will add overhead and call the DB everytime for an info that i already have
  | 
  |
  |------>{2}- he didn't make any previous request so i want to follow normal flow and resolve the tenant,
  .            [NOTE] if he logged in but didn't make any requests to resolve the tenant, we will get the uni name from the token
  .                      but if he didn't even loggin so i will take it from the request header

  [2] if he is Super Admin then he wants to manipulate data to a chosen university(tenant)  
          so he will provide it in an input filed (req.body)


   in the code to make it easier to follow i will refer to the main condition with square brackets [] and the subcategory with {}
       e.g ([1]->{2} refers to subcategory {2} of the main condition [1])
*/


export async function attachAndValidateTenant(
  req: Request,
  res: Response,
  next: NextFunction
) {

  // ************************************[1]->{1}*****************************
  if(req.schema_name){
    //We won't do anything it's already resolved from previous requests
    next();
  } 
  
  // ************************************[2]**********************************
  let university_name;
  
  if(IsSuperAdminFun(req)){
    //getting the wanted university from the body
    university_name = req.body?.university_name
    
    if(!university_name)
      throw new BadRequestError("university name must be provided in the body of the request")
  }
  // ***********************************[2]->{2}*************************************
  else{
    // tenant name extracted from decoded JWT token or the header if he didn't login (NEVER SWITCH THE (OR) Condition , if he is logged in , IT MUST be taken from the toekn not from passed headers)
    university_name = req.user?.university_name || req.headers["university-name"] as string;
    if (!university_name) {
      throw new BadRequestError("university-name header is required")
    }
  }
  //                    *****this part for validating the tenant****
  try {

      // connect to the public schema to check tenant metadata
      const prisma = getTenantClient("public");

      // verify that the tenant (university name) exists
      const university = await UniversityRepository.GetByName(university_name, prisma);

      if (!university) {
        throw new NotFoundError(`University ${university_name} doesn't Exist`)
      }

      if (!university.is_active) {
        throw new ForbiddenError(`University ${university_name} is currently inactive or under maintenance`)
      }

      //             *********attach tenant information to the request*******
      // this will later be used to resolve the correct database schema
      req.university_name = university_name;
      req.schema_name = university.db_schema;
      
    next();
  } catch (err: any) {
    next(err);
  }
}

// this IsSuperAdmin is a function so it returns true or false which what i need here  unlike the middleware version
function IsSuperAdminFun(req:Request) : boolean {
  if (req.user?.role?.includes("SuperAdmin")) {
    return true;
  }
  return false
}

