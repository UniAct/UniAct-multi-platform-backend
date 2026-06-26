import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { MAX_POST_FILE_SIZE_MB, MAX_POST_FILES, uploadPostAttachments } from "../Utils/MulterConfig";
import multer from "multer";

export const HandlePostAttachmentsUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadPostAttachments(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        let message = err.message;

        if (err.code === "LIMIT_FILE_SIZE") {
          message = `Each file must be under ${MAX_POST_FILE_SIZE_MB} MB`;
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
          message = "Unexpected file field";
        } else if (err.code === "LIMIT_FILE_COUNT") {
          message = `You can attach up to ${MAX_POST_FILES} files`;
        }

        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { files: message },
        });
      }

      if (err instanceof Error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { files: err.message },
        });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: "Unexpected error during file upload",
      });
    }

    next();
  });
};