import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../../Enums/Jsend";
import { RBACRepository } from "../../Repositories/RBACRepository";

export class AccountAuthorization {
  public static async HasAssignRolePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      const permissions: string[] = user!.permissions || [];

      if (!permissions.includes(RBACRepository.Account.AssignRole.name)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: JSendStatus.FAIL,
          message: `Forbidden`,
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: "An internal error occurred while checking permissions",
      });
    }
  }
}
