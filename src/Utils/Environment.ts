import dotenv from 'dotenv';
dotenv.config();

export class Environment{
  public static CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  public static CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  public static CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  public static IsDevelopment() : boolean {
    return process.env.NODE_ENV === "Development";
  }
}
