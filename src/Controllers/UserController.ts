import { Request, Response } from "express";
import { UserService } from "../Services/UserService";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { IStaffAccount } from "../Interfaces/StaffAccount";
import { UserLoginRequest } from "../Interfaces/User";


export class UserController {
  public static async Login(req: Request, res: Response) {
    
      const db_schema = req.schema_name!;
      const university_name = req.university_name!;
      const { email, password } = req.body as UserLoginRequest;

      const result = await UserService.Login(email, password, db_schema, university_name);

      return res.status(result.status).json(result.body);
  }



  //! TODO: Verify staff email
  public static async CreateStaffAccount(req: Request, res: Response) {
    try {
      const db_schema = req.schema_name;
      const data: IStaffAccount = req.body;

      const result = await UserService.CreateStaffAccount(
        { ...data },
        db_schema!
      );

      res.status(StatusCodes.CREATED).json({
        status: JSendStatus.SUCCESS,
        message: "Staff account created. Verification email has been sent.",
        data: result,
      });
    } catch (err: any) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        message: err.message || "Failed to create staff account",
      });
    }
  }

  public static async ActivateStaffAccount(req: Request, res: Response) {
    try {
      const email = req.user?.email;
      const schema_name = req.user?.schema_name;
      const university_name = req.user?.university_name;

      if (!email || !schema_name ||!university_name) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          message: "Invalid verification token payload",
        });
      }

      await UserService.ActivateStaffAccount(email, schema_name);

      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const encodedTenant = encodeURIComponent(university_name);
      return res.redirect(`${frontendBaseUrl}/verify-staff-account?status=success&tenant=${encodedTenant}`);
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Failed to verify staff account",
      });
    }
  }

  public static async GetAllStaffAccounts(req: Request, res: Response) {
    try {
      const db_schema = req.schema_name!;
      const result = await UserService.GetAllStaffAccounts(db_schema);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: result,
      });
    } catch (err: any) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        message: err.message || "Failed to fetch staff accounts",
      });
    }
  }

  public static async UpdateStaffAccount(req: Request, res: Response) {
    try {
      const db_schema = req.schema_name!;
      const staffId = parseInt(req.params.id as string, 10);
      const result = await UserService.UpdateStaffAccount(staffId, req.body, db_schema);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        message: "Staff account updated successfully",
        data: result,
      });
    } catch (err: any) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        message: err.message || "Failed to update staff account",
      });
    }
  }

  public static async DeleteStaffAccount(req: Request, res: Response) {
    try {
      const db_schema = req.schema_name!;
      const staffId = parseInt(req.params.id as string, 10);
      const deleted = await UserService.DeleteStaffAccount(staffId, db_schema);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        message: "Staff account deleted successfully",
        data: deleted,
      });
    } catch (err: any) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        message: err.message || "Failed to delete staff account",
      });
    }
  }
}
