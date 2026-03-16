import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { getTenantClient } from "../Utils/prismaClient";


export async function ExtractTenantField(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { university_name } = req.body;

    const prisma = getTenantClient("public");

    const university = await UniversityRepository.GetByName(university_name, prisma);

    if (!university) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { message: `University '${university_name}' Does Not Exist` },
      });
    }

    if (!university.is_active) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: JSendStatus.FAIL,
        data: {
          message: `University '${university_name}' is currently inactive or under maintenance.`,
        },
      });
    }

    req.tenant_name = university.name;
    req.schema_name = university.db_schema;

    next();
  } catch (err: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: JSendStatus.ERROR,
      message: err.message || "Internal Server Error",
    });
  }
}