import { Request, Response, NextFunction } from "express";
import ExcelJS from "exceljs";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";

/**
 * Middleware to validate Excel headers.
 * @param expectedHeaders - list of required header names in order
 */
export const ValidateExcelHeaders = (expectedHeaders: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const workbook = new ExcelJS.Workbook();

    try {
      const arrayBuffer = req.file!.buffer.buffer.slice(
        req.file!.buffer.byteOffset,
        req.file!.buffer.byteOffset + req.file!.buffer.byteLength
      );

      await workbook.xlsx.load(arrayBuffer as ArrayBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { file: "Excel file is empty or invalid" },
        });
      }

      const headers = (worksheet.getRow(1).values as string[]).slice(1);

      const missingHeaders = expectedHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: {
            file: `Missing required headers: ${missingHeaders.join(", ")}`,
          },
        });
      }

      req.excelFile = req.file;

      next();
    } catch (err) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { file: "Failed to read Excel file" },
      });
    }
  };
};