import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TokenPayload } from "../Interfaces/TokenPayload";


const IsAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: JSendStatus.FAIL,
        data: {
          message: "No token provided",
        },
      });
    }

    const secret = process.env.JWT_KEY;
    if (!secret) 
      throw new Error("JWT_KEY is not defined in environment variables");

    const decoded = jwt.verify(token, secret) as TokenPayload;

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: JSendStatus.ERROR,
      data: {
        message: "Invalid or expired token",
      },
    });
  }
};

export default IsAuthenticated;
