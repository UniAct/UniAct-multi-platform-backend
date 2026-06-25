import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { GetTenantClient } from "../Utils/prismaClient";
import { LearningGroupRepository } from "../Repositories/LearningGroupRepository";
import JSendStatus from "../Enums/Jsend";

export async function RequireLearningGroupOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const groupId = req.params.groupId as unknown as number;
  const userId = Number(req.user?.id);

  const prisma = GetTenantClient(req.schema_name!);

  const membership = await LearningGroupRepository.FindMembership(
    groupId,
    userId,
    prisma
  );

  if (!membership) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: JSendStatus.FAIL,
      message: "Learning group not found.",
    });
  }

  if (membership.role !== "Owner") {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: JSendStatus.FAIL,
      message: "Only group owners can perform this action.",
    });
  }

  next();
}