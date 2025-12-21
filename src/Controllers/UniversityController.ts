import { Request, Response } from "express";
import { UniversityService } from "../Services/UniversityService";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";
import { University } from "../generated/public";

class UniversityController {

  public static async Create(req: Request, res: Response) {
    const {
        name,
        address,
        phone,
        email,
        website,
        established_date,
        accreditation,
      }: {
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        established_date?: string;
        accreditation?: string;
      } = req.body;
    try {
      

      const university = await UniversityService.Create({
        name,
        address,
        phone,
        email,
        website,
        established_date: established_date ? new Date(established_date) : undefined,
        accreditation,
      });

      res.status(StatusCodes.CREATED).json({
        status: JSendStatus.SUCCESS,
        data: university,
        message: "University created successfully!",
      });
    } catch (err: any) {
      if (err.message.includes("already exists")) {
        return res.status(StatusCodes.BAD_REQUEST).json({
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
      const universities : University[] = await UniversityService.GetAll();

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: universities,
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
      const id = parseInt(req.params.id);
      const university = await UniversityService.GetById(id);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: university,
      });
    } catch (err: any) {
      res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { message: err.message },
      });
    }
  }

  public static async Delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deletedUniversity = await UniversityService.DeleteUniversity(id);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: { message: `University '${deletedUniversity.name}' deleted successfully.`, deletedUniversity },
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

  public static async AssignTenant(req: Request, res: Response) {
    try {
      const { tenant_id, university_id } = req.body;
      const tenant = await UniversityService.AssignUniversityToTenant(tenant_id, university_id);

      res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: tenant,
        message: `Tenant assigned to university successfully.`,
      });
    } catch (err: any) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: err.message },
      });
    }
  }
}

export default UniversityController;
