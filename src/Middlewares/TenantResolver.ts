import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { UniversityRepository } from "../Repositories/UniversityRepository";

const TENANT_HEADER = "x-tenant-id";

export async function TenantResolver(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tenant =
      (req.headers[TENANT_HEADER] as string)?.toLowerCase();

    if (!tenant) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: "X-Tenant-Id header is required" },
      });
    }

    const university = await UniversityRepository.GetByName(tenant);

    if (!university) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { message: `University '${tenant}' does not exist` },
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

    req.tenant_name = university.name;
    req.db_schema = university.db_schema;
    req.bucket_name = university.db_schema;

    next();
  } catch (err: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: JSendStatus.ERROR,
      message: err.message || "Internal Server Error",
    });
  }
}
