import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TenantService } from "../Services/TenantService";
import { Tenant } from "@prisma/client";

class TenantController {
  public static async Create(req: Request, res: Response) {
    try {
      const { name, subdomain, db_schema }: { name: string; subdomain: string; db_schema: string } = req.body;

      const tenant = await TenantService.CreateTenant({ name, subdomain, db_schema });

      res.status(StatusCodes.CREATED).json({
        status: JSendStatus.SUCCESS,
        message: "Tenant created successfully!",
        data: tenant,
      });
    } catch (err: any) {
      if (err.message.includes("Subdomain already in use")) {
        return res.status(StatusCodes.CONFLICT).json({
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
      const tenants: Tenant[] = await TenantService.GetAll();

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: tenants,
      });
    } catch (err: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async GetById(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      const tenant = await TenantService.GetById(id);

      if (!tenant) 
        return res.status(StatusCodes.NOT_FOUND).json({
          status: JSendStatus.FAIL,
          data: { message: `Tenant with id ${id} not found.` },
        });

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: tenant,
      });
    } catch (err: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async Delete(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      const tenant : Tenant = await TenantService.DeleteTenant(id);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: { message: `Tenant '${tenant.name}' deleted successfully.`, tenant },
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

export default TenantController;
