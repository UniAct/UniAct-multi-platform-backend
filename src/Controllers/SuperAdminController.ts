import { Request, Response } from "express";
import SuperAdminService from "../Services/SuperAdminService";
import JSendStatus from "../Enums/Jsend";
import { SuperAdmin } from "@prisma/client";

class SuperAdminController {
  public static async create(req: Request, res: Response) {
    try {
      const { username, email, password }: { username: string; email: string; password: string } = req.body;
      const admin : SuperAdmin = await SuperAdminService.CreateSuperAdmin(username, email, password);

      res.status(201).json({
        status: JSendStatus.SUCCESS,
        data: admin,
      });
    } catch (err: any) {
      if (err.message.includes("exists")) {
        return res.status(400).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      res.status(500).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async getAll(req: Request, res: Response) {
    try {
      const admins : SuperAdmin[] = await SuperAdminService.GetAllSuperAdmins();
      res.status(200).json({
        status: JSendStatus.SUCCESS,
        data: admins,
      });
    } catch (err: any) {
      res.status(500).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async deactivate(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const admin = await SuperAdminService.DeactivateSuperAdmin(username);

      res.status(200).json({
        status: JSendStatus.SUCCESS,
        data: { message: `SuperAdmin '${username}' deactivated successfully.`, admin },
      });
    } catch (err: any) {
      if (err.message.includes("not found")) {
        return res.status(404).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      res.status(500).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async activate(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const admin = await SuperAdminService.ActivateSuperAdmin(username);

      res.status(200).json({
        status: JSendStatus.SUCCESS,
        data: { message: `SuperAdmin '${username}' activated successfully.`, admin },
      });
    } catch (err: any) {
      if (err.message.includes("not found")) {
        return res.status(404).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      res.status(500).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const admin = await SuperAdminService.DeleteSuperAdmin(username);

      res.status(200).json({
        status: JSendStatus.SUCCESS,
        data: { message: `SuperAdmin '${username}' deleted successfully.`, admin },
      });
    } catch (err: any) {
      if (err.message.includes("not found")) {
        return res.status(404).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      res.status(500).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }
}

export default SuperAdminController;
