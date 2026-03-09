import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../../Enums/Jsend";

export const RequirePermission =
  (permission: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user?.id || !user.permissions?.includes(permission)) {
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
