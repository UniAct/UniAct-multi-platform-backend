import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TokenPayload } from "../Interfaces/TokenPayload";
import JwtService from "../Utils/JwtService";

export function ValidateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: "Token is required" },
      });
    }

    const normalizedToken = decodeURIComponent(token as string);
    const decoded: TokenPayload = JwtService.Verify(normalizedToken);

    req.user = decoded;

    next();
  } catch (err: any) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: JSendStatus.ERROR,
      data: { message: err?.message || "Invalid or expired token" },
    });
  }
};
