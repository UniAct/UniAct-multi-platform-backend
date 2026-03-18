import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { getTenantClient } from "../Utils/prismaClient";

/*
  Purpose of this middleware
  --------------------------
  This middleware resolves the tenant AFTER the user has been authenticated.

  The authentication middleware (IsAuthenticated) is responsible for:
  1. Validating the JWT token
  2. Decoding the token
  3. Attaching the decoded payload to req.user

  After that happens, this middleware reads the tenant name from:
      req.user.tenant_name

  Then it verifies that:
  - The tenant (university name) exists
  - The tenant is active
  - The correct database schema is assigned for the request

  If everything is valid, it attaches:
      req.tenant_name
      req.schema_name

  These values are later used by the application to connect to the correct
  tenant database schema.
*/


/*
  Why this middleware is separated from TenantResolver
  ----------------------------------------------------

  I intentionally created a second middleware instead of modifying
  the existing TenantResolver.

  Reason:
  Some endpoints in the system are PUBLIC and do not require authentication
  (they do not have a JWT token).

  Example:

      router.get("/:id",
          TenantResolver,
          ...FacultyValidator.IdParam(),
          ValidateRequest,
          asyncHandler(FacultyController.GetFacultyById)
      );

  In this case:
  - The request has NO token
  - Therefore req.user does not exist
  - The tenant must be resolved using the header:
        x-tenant-id

  If we forced authentication-based resolution for every endpoint,
  public endpoints would stop working.
*/


/*
  Security Concern
  ----------------

  Is allowing "x-tenant-id" dangerous?

  In this system it is NOT a vulnerability because:

  - Public endpoints are READ-ONLY operations.
  - They only fetch data.
  - They do NOT allow writing, updating, or deleting data.

  Even if a user changes the x-tenant-id header,
  they can only read publicly available data from that tenant.

  All WRITE operations require authentication,
  and in those cases we use TenantResolverAfterAuthentication
  which resolves the tenant from the JWT token instead of headers.
*/


export async function TenantResolverAfterAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const headerTenant = String(req.headers["x-tenant-id"] || req.headers["university-name"] || "").trim();
    const isSuperAdmin = req.user?.roles?.includes("SuperAdmin") || req.user?.role === "SuperAdmin";
    const tenant = req.user?.university_name || req.user?.tenant_name || (isSuperAdmin ? headerTenant : undefined);

    if (!tenant) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: isSuperAdmin ? "x-tenant-id is required for super admin tenant actions" : "Token is required" },
      });
    }

    // connect to the public schema to check tenant metadata
    const prisma = getTenantClient("public");

    // verify that the tenant (university name) exists
    const university = await UniversityRepository.GetByName(tenant, prisma);

    if (!university) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { message: `University '${tenant}' Does Not Exist` },
      });
    }

    if (!university.is_active) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: JSendStatus.FAIL,
        data: {
          message: `University '${tenant}' is currently inactive or under maintenance.`,
        },
      });
    }

    // attach tenant information to the request
    // this will later be used to resolve the correct database schema
    req.university_name = university.name;
    req.schema_name = university.db_schema;

    next();
  } catch (err: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: JSendStatus.ERROR,
      message: err.message || "Internal Server Error",
    });
  }
}
