import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserService } from "../Services/UserService";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import JwtService from "../Utils/JwtService";
import fs from "fs";


export class UserController {
  public static async Login(req: Request, res: Response) {
    try {
      const schema_name = req.tenant?.schema_name;
      const { email, password } = req.body;

      const user = await UserService.GetUserByEmail(email, schema_name!);
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: JSendStatus.FAIL,
          message: "Invalid email or password.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: JSendStatus.FAIL,
          message: "Invalid email or password.",
        });
      }

      const roles = await UserService.GetUserRoles(user.id, schema_name!);
      const permissions = await UserService.GetUserPermissions(user.id, schema_name!);

      const token = JwtService.Sign({
        id: user.id,
        email: user.email,
        university_name: schema_name,
        roles,
        permissions,
      });

      return res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        message: "Login successful.",
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
      });
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
      const tenant = req.tenant;
      const data = req.body;
      const file = req.file; 

      const result = await UserService.CreateStaffAccount(
        { ...data, cv: file ? file.path : undefined },
        tenant?.schema_name!
      );

      res.status(StatusCodes.CREATED).json({
        status: JSendStatus.SUCCESS,
        message: "Staff account created successfully",
        data: result,
      });
    } catch (err: any) {
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        });
      }
      
      res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        message: err.message || "Failed to create staff account",
      });
    }
  }
}
