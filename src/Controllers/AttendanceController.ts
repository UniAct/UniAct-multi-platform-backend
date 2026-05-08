import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { AttendanceService } from "../Services/AttendanceService";
import { CreateAttendanceSessionDto, ScanAttendanceDto, UpsertAttendancesDto } from "../Interfaces/Attendance/AttendanceSchema";
import { BadRequestError } from "../Types/Errors";

export class AttendanceController {
  static async GetCourseOptions(req: Request, res: Response) {
    const semesterId = Number(req.query.semesterId);
    if (!Number.isInteger(semesterId) || semesterId <= 0) {
      throw new BadRequestError("A valid semesterId is required.");
    }

    const teacherId = req.query.teacherId ? Number(req.query.teacherId) : null;
    const programId = req.query.programId ? Number(req.query.programId) : null;
    const academicLevel = req.query.academicLevel ? Number(req.query.academicLevel) : null;

    const courses = await AttendanceService.GetCourseOptions(
      semesterId,
      req.schema_name!,
      { teacherId, programId, academicLevel },
    );

    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data: courses });
  }

  static async CreateSession(req: Request, res: Response) {
    const payload = req.body as CreateAttendanceSessionDto;
    const session = await AttendanceService.CreateSession(payload, req.schema_name!);

    res.status(StatusCodes.CREATED).json({ status: JSendStatus.SUCCESS, data: session });
  }

  static async GetSession(req: Request, res: Response) {
    const id = Number(req.params.id);
    const session = await AttendanceService.GetSession(id, req.schema_name!);
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data: session });
  }

  static async GetSessionBySlotAndDate(req: Request, res: Response) {
    const scheduleSlotId = Number(req.params.scheduleSlotId);
    const date = String(req.query.date ?? "");
    const session = await AttendanceService.GetSessionBySlotAndDate(
      scheduleSlotId,
      date,
      req.schema_name!,
    );
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data: session });
  }

  static async GetEnrolledStudents(req: Request, res: Response) {
    const slotContextId = Number(req.params.slotContextId);
    const students = await AttendanceService.GetEnrolledStudents(slotContextId, req.schema_name!);
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data: students });
  }

  static async GetEnrolledStudentsByCourse(req: Request, res: Response) {
    const courseId = Number(req.params.courseId);
    const semesterId = req.query.semesterId ? Number(req.query.semesterId) : null;
    const students = await AttendanceService.GetEnrolledStudentsByCourse(courseId, semesterId, req.schema_name!);
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data: students });
  }

  static async UpsertAttendances(req: Request, res: Response) {
    const payload = req.body as UpsertAttendancesDto;
    const result = await AttendanceService.UpsertAttendances(payload, req.schema_name!);
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data: result, message: 'Attendances saved' });
  }

  static async GetMobileDashboard(req: Request, res: Response) {
    const data = await AttendanceService.GetMobileDashboard(req.user!, req.schema_name!);
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async GetStudentAttendanceStatus(req: Request, res: Response) {
    const semesterId = req.query.semesterId ? Number(req.query.semesterId) : undefined;
    const data = await AttendanceService.GetStudentAttendanceStatus(
      req.user!,
      req.schema_name!,
      semesterId,
    );

    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async ScanAttendance(req: Request, res: Response) {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      throw new BadRequestError("A valid attendance session id is required.");
    }

    const payload = req.body as ScanAttendanceDto;
    const data = await AttendanceService.ScanAttendanceFromQr(
      sessionId,
      payload,
      req.user!,
      req.schema_name!,
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data,
      message: "Attendance captured from QR scan.",
    });
  }
}
