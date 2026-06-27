import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { GetMinioClient } from "../Utils/MinioConfig";

function UseLocalStorage(): boolean {
  return (process.env.STORAGE_DRIVER || "").toLowerCase() === "local";
}

function getStorageRoot(): string {
  return path.resolve(process.env.LOCAL_STORAGE_ROOT || ".render-storage");
}

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getBucketPath(bucketName: string): string {
  return path.join(getStorageRoot(), sanitizeSegment(bucketName));
}

function getObjectPath(bucketName: string, objectName: string): string {
  return path.join(getBucketPath(bucketName), sanitizeSegment(objectName));
}

export class MinioRepository {

  static async BucketExists(bucketName : string): Promise<boolean> {
    if (UseLocalStorage()) {
      return fs.existsSync(getBucketPath(bucketName));
    }

    return GetMinioClient().bucketExists(bucketName);
  }

  static async CreateBucket(bucketName : string): Promise<void> {
    if (UseLocalStorage()) {
      await fs.promises.mkdir(getBucketPath(bucketName), { recursive: true });
      return;
    }

    await GetMinioClient().makeBucket(bucketName);
  }

  static async EnsureBucket(bucketName : string): Promise<void> {
    const exists = await MinioRepository.BucketExists(bucketName);
    if (!exists) await MinioRepository.CreateBucket(bucketName);
  }

  static async UploadFromBuffer(
    file: Express.Multer.File,
    bucketName : string
  ): Promise<string> {
    await MinioRepository.EnsureBucket(bucketName);
    const objectName = `${randomUUID()}-${file.originalname}`;

    if (UseLocalStorage()) {
      await fs.promises.writeFile(getObjectPath(bucketName, objectName), file.buffer);
      return objectName;
    }

    await GetMinioClient().putObject(bucketName, objectName, file.buffer, file.size, {
      "Content-Type": file.mimetype,
      "Original-Name": file.originalname,
    });
    return objectName;
  }

  static async DeleteBucket(bucketName: string): Promise<void> {
    if (UseLocalStorage()) {
      await fs.promises.rm(getBucketPath(bucketName), { recursive: true, force: true });
      return;
    }

    await GetMinioClient().removeBucket(bucketName);
  }

  static async Delete(bucketName : string , objectName: string): Promise<void> {
    if (UseLocalStorage()) {
      await fs.promises.rm(getObjectPath(bucketName, objectName), { force: true });
      return;
    }

    await GetMinioClient().removeObject(bucketName , objectName);
  }

  static async DeleteMany(bucketName : string , objectNames: string[]): Promise<void> {
    if (UseLocalStorage()) {
      await Promise.all(objectNames.map((objectName) => MinioRepository.Delete(bucketName, objectName)));
      return;
    }

    await GetMinioClient().removeObjects(bucketName, objectNames);
  }

  static async GetObject(bucketName: string, objectName: string) : Promise<Readable> {
    if (UseLocalStorage()) {
      return fs.createReadStream(getObjectPath(bucketName, objectName));
    }

    return GetMinioClient().getObject(bucketName, objectName);
  }
  
  static async UploadBuffer(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    await MinioRepository.EnsureBucket(bucketName);

    if (UseLocalStorage()) {
      await fs.promises.writeFile(getObjectPath(bucketName, objectName), buffer);
      return;
    }

    await GetMinioClient().putObject(bucketName, objectName, buffer, buffer.length, {
      "Content-Type": contentType,
    });
  }
}
