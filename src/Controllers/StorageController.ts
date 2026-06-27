import { Request, Response } from "express";
import { MinioRepository } from "../Repositories/MinioRepository";
import { BadRequestError } from "../Types/Errors";

function getSingleParam(value: string | string[] | undefined, name: string): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  throw new BadRequestError(`${name} must be a single non-empty string.`);
}

export class StorageController {
  static async GetObject(req: Request, res: Response) {
    const bucketName = getSingleParam(req.params.bucketName, "bucketName");
    const objectName = getSingleParam(req.params.objectName, "objectName");

    const stream = await MinioRepository.GetObject(bucketName, objectName);
    res.setHeader("Content-Disposition", `attachment; filename="${objectName.replace(/"/g, "")}"`);
    stream.pipe(res);
  }
}
