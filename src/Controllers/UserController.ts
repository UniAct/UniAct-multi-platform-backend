import { Request, Response } from "express";
import { UserService } from "../Services/UserService";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { IStaffAccount } from "../Interfaces/StaffAccount";


export class UserController {
  public static async Login(req: Request, res: Response) {
    try {
      const db_schema = req.schema_name!;
      const university_name = req.university_name!;
      const { email, password } = req.body;

      const result = await UserService.Login(email, password, db_schema , university_name);

      return res.status(result.status).json(result.body);
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: "An unexpected error occurred during login.",
        data: { error: err.message },
      });
    }
  }
  


  //! TODO: Verify staff email
  public static async CreateStaffAccount(req: Request, res: Response) {
    try {
      const db_schema = req.schema_name;
      const data : IStaffAccount = req.body;

      const result = await UserService.CreateStaffAccount(
        { ...data },
        db_schema!
      );

      res.status(StatusCodes.CREATED).json({
        status: JSendStatus.SUCCESS,
        message: "Staff account created successfully",
        data: result,
      });
    } catch (err: any) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        message: err.message || "Failed to create staff account",
      });
    }
  }
}
