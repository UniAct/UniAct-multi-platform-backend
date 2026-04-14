import { Request, Response, NextFunction } from "express";
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { GetTenantClient } from "../Utils/prismaClient";
import { BadRequestError, ForbiddenError, NotFoundError } from "../Types/Errors";
import { University } from "@prisma/client";

/*
  Conditions:

  [1] SuperAdmin:
      - University provided in body
      - Validate that it exists & is active

  [2] Normal user:
      SubCase {1}: Logged in with req.user.university_name
        - use that
      SubCase {2}: Not in user object
        - pull from 'university-name' header

  After determining university_name:
    - validate it via DB
    - attach schema_name and university_name to request
*/

let UniversityNameToSchemaMap: Record<string, string> = {};

export async function AttachAndValidateTenant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let university_name: string | undefined;

    // ************************ [1] Super Admin ************************

    if (IsSuperAdminFun(req)) {
      university_name = req.body?.university_name as string;

      if (!university_name)
        throw new BadRequestError(
          "university_name must be provided in the body for SuperAdmin"
        );

      // validate that provided university is valid
      const uni = await validateUniversity(university_name);

      attatchInfoToRequest(req, uni.name, uni.db_schema);
      return next();
    }

    // ********************** [2] Normal User ************************

    // if user has university and a mapping already exists
    if (req.user?.university_name) {
      const mappedSchema =
        UniversityNameToSchemaMap[req.user.university_name];

      if (mappedSchema) {
        attatchInfoToRequest(
          req,
          req.user.university_name,
          mappedSchema
        );
        return next();
      }

      // if we fall here user has a university but not yet in map — we validate
      university_name = req.user.university_name;
    }
    // otherwise pull university from header
    else {
      university_name = req.headers["university-name"] as string;
    }

    // require university
    if (!university_name) {
      throw new BadRequestError("university-name is required");
    }

    // validate and attach
    const validatedUni = await validateUniversity(university_name);

    attatchInfoToRequest(
      req,
      validatedUni.name,
      validatedUni.db_schema
    );

    return next();
  } catch (err) {
    return next(err);
  }
}

// ********************** Helper Functions **********************

function IsSuperAdminFun(req: Request): boolean {
  return !!req.user?.roles?.includes("SuperAdmin");
}

async function validateUniversity(
  university_name: string
): Promise<University> {
  const prisma = GetTenantClient("public");
  const university =
    await UniversityRepository.GetByName(university_name, prisma);

  if (!university) {
    throw new NotFoundError(`University ${university_name} doesn't exist`);
  }

  if (!university.is_active) {
    throw new ForbiddenError(
      `University ${university_name} is currently inactive`
    );
  }

  return university;
}

function attatchInfoToRequest(
  req: Request,
  university_name: string,
  schema_name: string
) {
  req.university_name = university_name;
  req.schema_name = schema_name;

  // update mapping for future requests
  UniversityNameToSchemaMap[university_name] = schema_name;
}