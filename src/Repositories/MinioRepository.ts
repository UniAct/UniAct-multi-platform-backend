import { randomUUID } from "crypto";
import { MinioClient } from "../Utils/MinioConfig";
import { Stream } from "nodemailer/lib/xoauth2";


export class MinioRepository {

  static async BucketExists(bucketName : string): Promise<boolean> {
    return MinioClient.bucketExists(bucketName);
  }

  static async CreateBucket(bucketName : string): Promise<void> {
    await MinioClient.makeBucket(bucketName);
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
    await MinioClient.putObject(bucketName, objectName, file.buffer, file.size, {
      "Content-Type": file.mimetype,
      "Original-Name": file.originalname,
    });
    return objectName;
  }

  static async DeleteBucket(bucketName: string): Promise<void> {
    await MinioClient.removeBucket(bucketName);
  }

  static async Delete(bucketName : string , objectName: string): Promise<void> {
    await MinioClient.removeObject(bucketName , objectName);
  }

  static async DeleteMany(bucketName : string , objectNames: string[]): Promise<void> {
    await MinioClient.removeObjects(bucketName, objectNames);
  }

  static async GetObject(bucketName: string, objectName: string) : Promise<Stream.Readable> {
    return MinioClient.getObject(bucketName, objectName);
  }
  
  static async UploadBuffer(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    await MinioRepository.EnsureBucket(bucketName);
    await MinioClient.putObject(bucketName, objectName, buffer, buffer.length, {
      "Content-Type": contentType,
    });
  }
}