import jwt, { JwtPayload } from "jsonwebtoken";
import { TokenPayload } from "../Interfaces/TokenPayload";


export default class JwtService {
  private static secret: string = process.env.JWT_KEY || "";
  private static expiresIn: string = process.env.TOKEN_LIFETIME || "24h";

  public static sign(payload: TokenPayload): string {
    if (!this.secret) throw new Error("JWT_KEY is not defined in environment variables");

    return jwt.sign(payload, this.secret);
  }

  public static verify(token: string): TokenPayload {
    if (!this.secret) throw new Error("JWT_KEY is not defined in environment variables");

    const decoded = jwt.verify(token, this.secret);
    return decoded as TokenPayload;
  }

  public static decode(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as TokenPayload;
    } catch (err) {
      return null;
    }
  }
}
