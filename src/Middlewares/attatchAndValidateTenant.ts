import { Request, Response, NextFunction } from "express";
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { GetTenantClient } from "../Utils/prismaClient";
import { BadRequestError, ForbiddenError, NotFoundError } from "../Types/Errors";
import { University } from "@prisma/client";

/*
 We have [2] conditions for the request
 
 [1] if he is Super Admin then he wants to manipulate data to a chosen university(tenant)  
  .       so he will provide it in an input filed (req.body), and then validate the provided university as well

 [2] if he is a normal user then we have 2 subcategories
  |
  |----> {1}-He is logged in already, 
  |            so i just want to attach the schema and the university name to the req
  | 
  |
  |------>{2} -He is NOT logged in 
  .              we will take university name from the request header and validate the university if it exists or if it's active or not
  .                 then we will attach the schema and the university name to the req


   in the code to make it easier to follow i will refer to the main condition with square brackets [] and the subcategory with {}
       e.g ([2]->{1} refers to subcategory {1} of the main condition [2])
*/


export async function AttachAndValidateTenant(
  req: Request,
  res: Response,
  next: NextFunction
) {

    let university_name;
    
    // ************************************[1]**********************************
    
    if (IsSuperAdminFun(req)) {
      
      //getting the wanted university from the body
      university_name = req.body?.university_name

      if (!university_name)
        throw new BadRequestError("university name must be provided in the body of the request")
    }

    //***********************************[2]***************************************************** */

    else {

      // university name extracted from the token or university-name header for unauthenticated requests.
      university_name = req.user?.university_name || req.headers["university-name"] as string;

      if (!university_name) {
        throw new BadRequestError("university-name header is required")
      }
    }

    try{
      //                          validation
        const unviersity = await validateUniversity(university_name);

        //                        Attach information
        attatchInfoToRequest(req, unviersity.name, unviersity.db_schema)
        next();

    }catch(err:any){
      return next(err);
    }
  }


//                             ************Helper Functions Section************      

// this IsSuperAdmin is a function so it returns true or false which what i need here  unlike the middleware version
function IsSuperAdminFun(req: Request): boolean {
  return !!req.user?.roles?.includes("SuperAdmin");
}


async function validateUniversity(university_name:string): Promise<University>{

    const prisma = GetTenantClient("public");
    const university = await UniversityRepository.GetByName(university_name, prisma);


    // verify that the university (university name) exists
    if (!university) {
      throw new NotFoundError(`University ${university_name} doesn't Exist`)
    }
    //verify that the unviersity is Active
    if (!university.is_active) {
      throw new ForbiddenError(`University ${university_name} is currently inactive or under maintenance`)
    }

    return university;
}

function attatchInfoToRequest(req:Request, university_name: string, schema_name :string){
  // this will later be used to resolve the correct database schema
  req.university_name = university_name;
  req.schema_name = schema_name;
  
}
