import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TokenPayload } from "../Interfaces/TokenPayload";
import JwtService from "../Utils/JwtService";

export function ValidateToken (req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: "Token is required" },
      });
    }

    const decoded : TokenPayload = JwtService.Verify(token as string);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: JSendStatus.ERROR,
      data: { message: "Invalid or expired token" },
    });
  }
};
