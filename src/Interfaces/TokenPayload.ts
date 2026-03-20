import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  id?: number;
  username?: string;
  email?: string;
  schema_name?: string;
  roles?: string[];
  permissions?: string[];
  university_name?: string;
}
