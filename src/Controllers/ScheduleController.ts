import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { ScheduleService } from "../Services/ScheduleService";
import { GetScheduleQuery, SaveScheduleInput } from "../Interfaces/ScheduleSlot/ScheduleSlotSchema";
import { GetTenantClient } from "../Utils/prismaClient";
import { EnrollInScheduleRequestDto } from "../Interfaces/Enrollment/EnrollInScheduleSchema";


export class ScheduleController {
  static async GetSchedule(req: Request, res: Response) {

    const {programId, academicLevel, facultyId}= req.query as unknown as GetScheduleQuery;

    // will be needed to determine filtering and shape of the response 
  const isStudent = !!req.user?.isStudent;
  const studentId = isStudent ? req.user?.id : undefined;

    const Timetable = await ScheduleService.GetSchedule(
      {programId, academicLevel, facultyId},
      req.semester_id!,
      req.schema_name!,
      studentId
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data:Timetable,
    });
  }

  static async SaveSchedule(req: Request, res: Response) {

    const payload = req.body as SaveScheduleInput;
    
    const result =await GetTenantClient(req.schema_name!).$transaction(async (tx) =>{
        return await ScheduleService.SaveSchedule(payload, req.semester_id!, tx);
    })

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: "Timetable saved successfully",
    });
  }

  static async Enroll(req: Request, res: Response) {
    const currentSemester = Number(req.user?.semester?.id);
    const studentId = Number(req.user?.id);
    const currentStudentProgramLevelId = Number(req.user?.programLevel?.id);
    const studentProgramId = Number(req.user?.program?.id);
    const schedule = req.body as EnrollInScheduleRequestDto;
    
    const result = await ScheduleService.Enroll(
      req.schema_name! , 
      studentId , 
      currentStudentProgramLevelId , 
      studentProgramId , 
      currentSemester , 
      schedule
    );

    res.status(StatusCodes.ACCEPTED).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: "Your enrollment request has been received and is being processed.",
    });
  }
}
