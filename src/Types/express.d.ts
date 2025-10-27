import "express";
import { TokenPayload } from "../Interfaces/TokenPayload";
import { TenantPayload } from "../Interfaces/TenantPayload";

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload; 
    tenant?: TenantPayload;
  }
}
