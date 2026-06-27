import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { ScheduleService } from "../Services/ScheduleService";
import { GetScheduleQuery, SaveScheduleInput } from "../Interfaces/ScheduleSlot/ScheduleSlotSchema";
import { GetTenantClient } from "../Utils/prismaClient";
import { EnrollInScheduleRequestDto } from "../Interfaces/Enrollment/EnrollInScheduleSchema";
import { AdminEnrollmentService } from "../Services/AdminEnrollmentService";
import {
  AdminEnrollmentCreateDto,
  AdminEnrollmentQuery,
  AdminEnrollmentUpdateDto,
} from "../Interfaces/Enrollment/AdminEnrollmentSchema";


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
    const currentSemesterId = Number(req.user?.semester?.id);
    const currentTerm = Number(req.user?.semester?.term);
    const studentId = Number(req.user?.id);
    const cgpa = Number(req.user?.student?.cgpa)
    const currentStudentProgramLevelId = Number(req.user?.programLevel?.id);
    const studentProgramId = Number(req.user?.program?.id);
    const schedule = req.body as EnrollInScheduleRequestDto;
    
    const result = await ScheduleService.Enroll(
      req.schema_name! , 
      studentId , 
      cgpa,
      currentStudentProgramLevelId , 
      studentProgramId , 
      {id:currentSemesterId , term: currentTerm},
      schedule
    );

    res.status(StatusCodes.ACCEPTED).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: "Your enrollment request has been received and is being processed.",
    });
  }

  static async ListAdminEnrollments(req: Request, res: Response) {
    const query = req.query as unknown as AdminEnrollmentQuery;
    const result = await AdminEnrollmentService.List(req.schema_name!, query);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
    });
  }

  static async GetAdminEnrollmentOptions(req: Request, res: Response) {
    const query = req.query as unknown as AdminEnrollmentQuery;
    const result = await AdminEnrollmentService.GetOptions(req.schema_name!, query);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
    });
  }

  static async GetAdminStudentEnrollmentTrack(req: Request, res: Response) {
    const { studentId } = req.params as unknown as { studentId: number };
    const query = req.query as unknown as AdminEnrollmentQuery;
    const result = await AdminEnrollmentService.GetStudentTrack(req.schema_name!, studentId, query);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
    });
  }

  static async CreateAdminEnrollment(req: Request, res: Response) {
    const payload = req.body as AdminEnrollmentCreateDto;
    const result = await AdminEnrollmentService.Create(req.schema_name!, payload);

    res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: "Enrollment created successfully",
    });
  }

  static async UpdateAdminEnrollment(req: Request, res: Response) {
    const { id } = req.params as unknown as { id: number };
    const payload = req.body as AdminEnrollmentUpdateDto;
    const result = await AdminEnrollmentService.Update(req.schema_name!, id, payload);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: "Enrollment updated successfully",
    });
  }

  static async DeleteAdminEnrollment(req: Request, res: Response) {
    const { id } = req.params as unknown as { id: number };
    const result = await AdminEnrollmentService.Delete(req.schema_name!, id);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: "Enrollment deleted successfully",
    });
  }
}
