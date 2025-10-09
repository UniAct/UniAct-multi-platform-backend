import "express";
import { TokenPayload } from "../Interfaces/TokenPayload";

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload; 
  }
}