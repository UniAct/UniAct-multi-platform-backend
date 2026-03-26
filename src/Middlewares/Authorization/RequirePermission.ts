import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../../Enums/Jsend";
import { GetTenantClient } from "../../Utils/prismaClient";
import { RBACRepository } from "../../Repositories/RBACRepository";

export const RequirePermission =
  (permission: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user?.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: JSendStatus.FAIL,
          data: { message: "Access denied" },
        });
      }

      if (user.permissions?.includes(permission)) {
        return next();
      }

      // Fallback to live database permissions in case JWT permission snapshot is outdated.
      const schemaName = req.schema_name;
      if (!schemaName) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: JSendStatus.FAIL,
          data: { message: "Access denied" },
        });
      }

      const prisma = GetTenantClient(schemaName);
      const currentPermissions = await RBACRepository.GetUserPermissions(user.id, prisma);
      req.user = {
        ...user,
        permissions: currentPermissions,
      };

      if (!currentPermissions.includes(permission)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: JSendStatus.FAIL,
          data: { message: "Access denied" },
        });
      }

      next();
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: "Something went wrong",
        data: { error: err.message },
      });
    }
  };
