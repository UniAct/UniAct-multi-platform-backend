import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  id?: number;
  username?: string;
  email?: string;
  schema_name?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  tenant_name?: string;
  university_name?: string;
}
