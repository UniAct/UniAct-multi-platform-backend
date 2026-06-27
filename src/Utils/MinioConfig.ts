import * as Minio from 'minio'
import dotenv from 'dotenv';
dotenv.config();

let minioClient: Minio.Client | undefined;

export function GetMinioClient(): Minio.Client {
  if (!minioClient) {
    minioClient = new Minio.Client({
      endPoint: process.env.MINIO_URL!,
      port: parseInt(process.env.MINIO_PORT!),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });
  }

  return minioClient;
}
