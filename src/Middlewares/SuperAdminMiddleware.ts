import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";

export function IsSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: JSendStatus.FAIL,
      data: { message: "User not authenticated" },
    });
  }

  const isSuperAdmin = req.user.roles?.includes("SuperAdmin");
  if (!isSuperAdmin) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: JSendStatus.FAIL,
      data: { message: "Access denied" },
    });
  }

  next();
}
