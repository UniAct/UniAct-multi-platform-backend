import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TokenPayload } from "../Interfaces/TokenPayload";
import JwtService from "../Utils/JwtService";


export default function IsAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const rawAuthHeader =
      req.get("Authorization") ||
      req.headers["authorization"] ||
      req.headers["Authorization"];

    const authHeader = Array.isArray(rawAuthHeader)
      ? rawAuthHeader[0]
      : typeof rawAuthHeader === "string"
      ? rawAuthHeader
      : undefined;

    const token = authHeader
      ? authHeader.trim().replace(/^Bearer\s+/i, "")
      : undefined;

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

