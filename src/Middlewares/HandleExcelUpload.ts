import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { MAX_FILE_SIZE_MB, uploadExcel } from "../Utils/MulterConfig";
import multer from "multer";

export const HandleExcelUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadExcel(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        let message = err.message;

        if (err.code === "LIMIT_FILE_SIZE") {
          message = `File size exceeds the allowed limit of ${MAX_FILE_SIZE_MB} MB`;
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
          message = "Unexpected file field";
        }

        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { file: message },
        });
      }

      if (err instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { file: err.message },
        });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: "Unexpected error during file upload",
      });
    }

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { file: "No file uploaded" },
      });
    }

    next();
  });
};