import { NextFunction, Request, Response } from "express";
import { GetTenantClient } from "../Utils/prismaClient";
import { SemesterRepository } from "../Repositories/SemesterRepository";
import { BadRequestError, NotFoundError } from "../Types/Errors";

export async function RequireSemesterHeader(req: Request, _res: Response, next: NextFunction) {
  const rawSemesterId = req.headers["semester-id"] ?? req.headers["x-semester-id"];

  const normalized = Array.isArray(rawSemesterId) ? rawSemesterId[0] : rawSemesterId;
  if (!normalized) {
    throw new BadRequestError("Please select semester first");
  }

  const semesterId = Number(normalized);
  if (!Number.isInteger(semesterId) || semesterId <= 0) {
    throw new BadRequestError("semester-id header must be a positive integer");
  }

  const prisma = GetTenantClient(req.schema_name!);
  const semester = await SemesterRepository.GetSemesterById(semesterId, prisma);

  if (!semester) {
    throw new NotFoundError("Selected semester was not found");
  }

  req.semester_id = semesterId;
  next();
}
