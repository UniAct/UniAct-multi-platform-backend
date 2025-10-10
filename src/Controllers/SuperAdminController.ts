import { Request, Response } from "express";
import SuperAdminService from "../Services/SuperAdminService";
import JSendStatus from "../Enums/Jsend";
import { SuperAdmin } from "@prisma/client";
import { MailService } from "../Services/MailService/MailService";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import JwtService from "../Utils/JwtService";
import SystemRoles from "../Enums/SystemRoles";

class SuperAdminController {
  public static async Register(req: Request, res: Response) {
    try {
      const { username, email, password }: { username: string; email: string; password: string } = req.body;
      
      await SuperAdminService.CreateSuperAdmin(username, email, password);

      await MailService.SendVerificationMail(email);

      res.status(StatusCodes.CREATED).json({
        status: JSendStatus.SUCCESS,
        message: "SuperAdmin created and confirmation email sent!"
      });
    } catch (err: any) {
      if (err.message.includes("exists")) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async GetAll(req: Request, res: Response) {
    try {
      const admins : SuperAdmin[] = await SuperAdminService.GetAllSuperAdmins();
      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: admins,
      });
    } catch (err: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async Activate(req: Request, res: Response) {
    try {
      const email = req.user?.email;

      if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { message: "Invalid token payload" },
        });
      }

      const admin = await SuperAdminService.ActivateSuperAdmin(email);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: { message: `SuperAdmin '${admin.username}' activated successfully.`},
      });
    } catch (err: any) {
      if (err.message.includes("not found")) {
        return res.status(404).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async Login(req : Request , res : Response){
    try{
      const {email , password} : {email : string , password : string} = req.body;
      const admin = await SuperAdminService.GetSuperAdminByEmail(email);
      if (!admin) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: JSendStatus.FAIL,
          data: { message: "SuperAdmin not found" },
        });
      }

      if (!admin.is_active) {
        return res.status(StatusCodes.FORBIDDEN).json({
          status: JSendStatus.FAIL,
          data: { message: "Account is not verified" },
        });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: JSendStatus.FAIL,
          data: { message: "Invalid credentials" },
        });
      }

      //! for testing purposes
      if (!process.env.JWT_KEY || !process.env.TOKEN_LIFETIME) {
        throw new Error("JWT_KEY or TOKEN_LIFETIME not defined in .env");
      }

      const token = JwtService.Sign({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: SystemRoles.SuperAdmin
      });

      return res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: {
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
          },
        },
      });
    }
    catch (err: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async Delete(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const admin = await SuperAdminService.DeleteSuperAdmin(username);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: { message: `SuperAdmin '${username}' deleted successfully.`, admin },
      });
    } catch (err: any) {
      if (err.message.includes("not found")) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }
}

export default SuperAdminController;
