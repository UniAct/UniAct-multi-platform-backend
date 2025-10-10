import jwt, { SignOptions } from "jsonwebtoken";
import { TokenPayload } from "../Interfaces/TokenPayload";

export default class JwtService {
  private static readonly secret = process.env.JWT_KEY;
  private static readonly expiresIn: SignOptions["expiresIn"] = (process.env.TOKEN_LIFETIME || "24h") as SignOptions["expiresIn"];

  private static EnsureSecret(): string {
    if (!this.secret) {
      throw new Error("JWT_KEY is not defined in environment variables");
    }
    return this.secret;
  }

  public static Sign(payload: TokenPayload): string {
    const secret = this.EnsureSecret();
    return jwt.sign(payload, secret, { expiresIn: this.expiresIn });
  }

  public static Verify(token: string): TokenPayload {
    const secret = this.EnsureSecret();

    try {
      const decoded = jwt.verify(token, secret);
      return decoded as TokenPayload;
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new Error("Token expired");
      }
      throw new Error("Invalid token");
    }
  }

  public static Decode(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as TokenPayload | null;
    } catch {
      return null;
    }
  }
}
