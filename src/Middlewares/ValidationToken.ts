import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TokenPayload } from "../Interfaces/TokenPayload";

export function ValidateToken (req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: "Token is required" },
      });
    }

    const secret = process.env.JWT_KEY;
    if (!secret) throw new Error("JWT_KEY is not defined in environment variables");

    const decoded = jwt.verify(token, secret);

    req.user = decoded as TokenPayload;

    next();
  } catch (err) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: JSendStatus.ERROR,
      data: { message: "Invalid or expired token" },
    });
  }
};
