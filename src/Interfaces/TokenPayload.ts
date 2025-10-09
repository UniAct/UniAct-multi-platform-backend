import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  id?: number;
  username?: string;
  email?: string;
  role?: string;
}
