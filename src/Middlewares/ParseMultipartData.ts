import { Request, Response, NextFunction } from "express";
import JSendStatus from "../Enums/Jsend";

export const ParseMultipartData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.data) {
    try {
      const parsed = typeof req.body.data === 'string' 
        ? JSON.parse(req.body.data) 
        : req.body.data;
      req.body = { ...req.body, ...parsed };
      delete req.body.data; // Remove the original data field
    } catch (error) {
      return res.status(400).json({
        status: JSendStatus.FAIL,
        message: "Invalid JSON in data field",
      });
    }
  }
  next();
};