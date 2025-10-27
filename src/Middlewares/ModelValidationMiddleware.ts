import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import JSendStatus from "../Enums/Jsend";
import fs from "fs";

const ValidateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Delete uploaded file if validation fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    
    return res.status(400).json({
      status: JSendStatus.FAIL,
      data: errors.array(),
    });
  }
  next();
};

export default ValidateRequest;