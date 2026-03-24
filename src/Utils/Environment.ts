import dotenv from 'dotenv';
dotenv.config();

export class Environment{
  public static IsDevelopment(){
    return process.env.NODE_ENV === "Development";
  }
}