import { NextFunction, Request, Response } from "express";
import { UniversityService } from "../Services/UniversityService";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";
import { Prisma, PrismaClient, University } from "@prisma/client"

class UniversityController {

  public static async Create(req: Request, res: Response, next: NextFunction) {

    let {
      name,
      address,
      phone,
      email,
      website,
      established_date,
      accreditation,
      db_schema
    }: Prisma.UniversityCreateInput = req.body;

    const university = await UniversityService.Create({
      name,
      address,
      phone,
      email,
      website,
      established_date: established_date ? new Date(established_date) : undefined,
      accreditation,
      db_schema,
      is_active: true
    });

    res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data: university,
      message: "University created successfully!",
    });

  }


  public static async GetAll(req: Request, res: Response) {
    try {
      const universities: University[] = await UniversityService.GetAll();

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
      const id = parseInt(req.params.id as string);
      const university = await UniversityService.GetById(id,);

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

    const id = parseInt(req.params.id as string);
    const deletedUniversity = await UniversityService.DeleteUniversity(id);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: { message: `University '${deletedUniversity.name}' deleted successfully.`, deletedUniversity },
    });

  }
  public static async Activate(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      const university = await UniversityService.Activate(id,);

      return res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: university,
        message: "University activated successfully!",
      });
    } catch (err: any) {
      if (err.message.includes("does not exist")) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      if (err.message.includes("already active")) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }


  public static async Deactivate(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      const university = await UniversityService.Deactivate(id);

      return res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: university,
        message: "University deactivated successfully!",
      });
    } catch (err: any) {
      if (err.message.includes("does not exist")) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      if (err.message.includes("already inactive")) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { message: err.message },
        });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async List(req: Request, res: Response) {
    try {
      const universities = await UniversityService.ListNames();
      return res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: universities,
      });
    } catch (err: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: JSendStatus.ERROR,
        message: err.message || "Internal Server Error",
      });
    }
  }

  public static async GetUniversityBySchemaName(req: Request, res: Response) {
    try {
      const schema = String(req.params.schema || "").trim().toLowerCase();

      if (!schema) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: JSendStatus.FAIL,
          data: { message: "Tenant schema is required." },
        });
      }

      const university = await UniversityService.GetUniversityBySchemaName(schema);

      return res.status(StatusCodes.OK).json({
        status: JSendStatus.SUCCESS,
        data: university,
      });
    } catch (err: any) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { message: err.message || "University not found." },
      });
    }
  }

}

export default UniversityController;
