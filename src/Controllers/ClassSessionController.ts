import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { ClassSessionService } from "../Services/ClassSessionService";
import {
  ClassSessionLevelQuery,
  SaveClassSessionLevelBodyDto,
} from "../Interfaces/ClassSession/ClassSessionSchema";

export class ClassSessionController {
  static async GetLevelTimetable(req: Request, res: Response) {
    const query = req.query as unknown as ClassSessionLevelQuery;
    const programId = Number(query.programId);
    const academicLevel = Number(query.academicLevel);

    const data = await ClassSessionService.GetLevelTimetable(
      {
        programId,
        academicLevel,
      },
      req.semester_id!,
      req.schema_name!,
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data,
    });
  }

  static async SaveLevelTimetable(req: Request, res: Response) {
    const payload = req.body as SaveClassSessionLevelBodyDto;

    const result = await ClassSessionService.SaveLevelTimetable(
      payload,
      req.semester_id!,
      req.schema_name!,
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: "Timetable saved successfully",
    });
  }
}
