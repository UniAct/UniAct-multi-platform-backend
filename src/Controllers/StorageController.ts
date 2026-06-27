import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MinioRepository } from "../Repositories/MinioRepository";

export class StorageController {
  static async GetObject(req: Request, res: Response) {
    const bucketName = req.params.bucketName;
    const objectName = req.params.objectName;

    if (!bucketName || !objectName) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "fail",
        data: { message: "bucketName and objectName are required" },
      });
    }

    const stream = await MinioRepository.GetObject(bucketName, objectName);
    res.setHeader("Content-Disposition", `attachment; filename="${objectName.replace(/"/g, "")}"`);
    stream.pipe(res);
  }
}
