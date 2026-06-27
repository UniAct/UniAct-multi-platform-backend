import { NextFunction, Request, Response } from "express";
import { UniversityService } from "../Services/UniversityService";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";
import { Prisma, PrismaClient, University } from "@prisma/client"
import { GetTenantClient } from "../Utils/prismaClient";

class UniversityController {

  public static async Create(req: Request, res: Response) {

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

      const university = await UniversityService.GetPublicProfile(schema);

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

  public static async GetPublicStats(req: Request, res: Response) {
    const schema = String(req.params.schema || "").trim().toLowerCase();

    if (!schema) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: "Tenant schema is required." },
      });
    }

    const prisma = GetTenantClient(schema);

    const [studentCount, staffCount, facultyCount, programCount] = await Promise.all([
      prisma.student.count(),
      prisma.staff.count(),
      prisma.faculty.count(),
      prisma.program.count(),
    ]);

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: {
        students: studentCount,
        staff: staffCount,
        faculties: facultyCount,
        programs: programCount,
      },
    });
  }

  public static async GetSettings(req: Request, res: Response) {
    const university = await UniversityService.GetUniversityBySchemaName(req.schema_name!);
    const settings = await UniversityService.GetSettings(university.id);

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: settings,
    });
  }

  public static async GetAnalytics(req: Request, res: Response) {
    const analytics = await UniversityService.GetTenantAnalytics(req.schema_name!);

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: analytics,
    });
  }

  public static async UpdateSettings(req: Request, res: Response) {
    const { primary_color, secondary_color, tab_name, logo_url } = req.body;
    const university = await UniversityService.GetUniversityBySchemaName(req.schema_name!);
    const settings = await UniversityService.UpdateSettings(university.id, {
      primary_color,
      secondary_color,
      tab_name,
      logo_url,
    });

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: settings,
    });
  }

  public static async UploadLogo(req: Request, res: Response) {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: "No image provided" },
      });
    }

    const university = await UniversityService.GetUniversityBySchemaName(req.schema_name!);
    const url = await UniversityService.UploadLogo(university.id, req.schema_name!, req.file);

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: { logo_url: url },
    });
  }

  public static async UploadHeroImage(req: Request, res: Response) {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: "No image provided" },
      });
    }

    const university = await UniversityService.GetUniversityBySchemaName(req.schema_name!);
    const hero_images = await UniversityService.UploadHeroImage(university.id, req.schema_name!, req.file);

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: { hero_images },
    });
  }

  public static async DeleteHeroImage(req: Request, res: Response) {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: JSendStatus.FAIL,
        data: { message: "Hero image URL is required" },
      });
    }

    const university = await UniversityService.GetUniversityBySchemaName(req.schema_name!);
    const hero_images = await UniversityService.DeleteHeroImage(university.id, url);

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: { hero_images },
    });
  }

}

export default UniversityController;
