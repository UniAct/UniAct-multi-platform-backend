import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../../Enums/Jsend";
import { RBACRepository } from "../../Repositories/RBACRepository";

export class RBACAuthorization {
  public static async HasCreatePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { message: "Invalid user" },
        });
      }

      const permissions = req.user?.permissions!;

      if (!permissions.includes(RBACRepository.RBAC.Create.name)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: JSendStatus.FAIL,
          data: { message: "Access denied. Missing 'rbac.create' permission" },
        });
      }

      next();
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: "Authorization check failed",
        data: { error: err.message },
      });
    }
  }

  public static async HasReadPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { message: "Invalid user" },
        });
      }

      const permissions = req.user?.permissions!;

      if (!permissions.includes(RBACRepository.RBAC.Read.name)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: JSendStatus.FAIL,
          data: { message: "Access denied. Missing 'rbac.read' permission" },
        });
      }

      next();
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: "Authorization check failed",
        data: { error: err.message },
      });
    }
  }

  public static async HasUpdatePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { message: "Invalid user" },
        });
      }

      const permissions = req.user?.permissions!;

      if (!permissions.includes(RBACRepository.RBAC.Update.name)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: JSendStatus.FAIL,
          data: { message: "Access denied. Missing 'rbac.update' permission" },
        });
      }

      next();
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: "Authorization check failed",
        data: { error: err.message },
      });
    }
  }

  public static async HasDeletePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { message: "Invalid user" },
        });
      }

      const permissions = req.user?.permissions!;

      if (!permissions.includes(RBACRepository.RBAC.Delete.name)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: JSendStatus.FAIL,
          data: { message: "Access denied. Missing 'rbac.delete' permission" },
        });
      }

      next();
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: "Authorization check failed",
        data: { error: err.message },
      });
    }
  }
  
}
