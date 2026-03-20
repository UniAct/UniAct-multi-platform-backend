import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TokenPayload } from "../Interfaces/TokenPayload";
import JwtService from "../Utils/JwtService";


export default function IsAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: JSendStatus.FAIL,
        data: { message: "No token provided" },
      });
    }

    const decoded: TokenPayload = JwtService.Verify(token);

    req.user = decoded;

    next();
  } catch (err: any) {
    const isExpired = typeof err?.message === "string" && err.message.toLowerCase().includes("expired");
    return res.status(StatusCodes.FORBIDDEN).json({
      status: JSendStatus.ERROR,
      data: { message: isExpired ? "Token expired" : "Invalid token" },
    });
  }
}

