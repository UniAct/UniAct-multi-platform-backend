import { StatusCodes } from "http-status-codes";
import { CreateEnrollmentWindowInput, FindEnrollmentWindowQuery, UpdateEnrollmentWindowInput } from "../Interfaces/Enrollment-Window/EnrollmentWindow";
import { Request, Response } from "express";
import JSendStatus from "../Enums/Jsend";
import { EnrollmentWindowService } from "../Services/EnrollmentWindow";


export class EnrollmentWindowController {
  
  // 1. Create an Enrollment Window (Admin function)
  static async CreateEnrollmentWindow(req: Request, res: Response) {
    const payload = req.body as CreateEnrollmentWindowInput;

    const result = await EnrollmentWindowService.CreateEnrollmentWindow(
      payload,
      req.schema_name!
    );

    res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: "Enrollment window created successfully",
    });
  }

  static async FindConfiguredEnrollmentWindow(req: Request, res: Response) {
    const query = req.query as unknown as FindEnrollmentWindowQuery;

    const result = await EnrollmentWindowService.FindConfiguredEnrollmentWindow(
      query,
      req.schema_name!
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: result ? "Enrollment window loaded successfully" : "No enrollment window configured",
    });
  }

  // 2. Update an Enrollment Window (Admin function)
  static async UpdateEnrollmentWindow(req: Request, res: Response) {
    const { id } = req.params as unknown as { id: number };
    const payload = req.body as UpdateEnrollmentWindowInput;

    const result = await EnrollmentWindowService.UpdateEnrollmentWindow(
      id,
      payload,
      req.schema_name!
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: "Enrollment window updated successfully",
    });
  }

}
