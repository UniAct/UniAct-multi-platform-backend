import "express";
import { TokenPayload } from "../Interfaces/TokenPayload";
import { TenantPayload } from "../Interfaces/TenantPayload";

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload;
    schema_name?: string;
    university_name?: string;
    semester_id?: number;
    bucket_name?: string;
    excelFile?: Express.Multer.File;
  }
}
