import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { ClassroomUpsertInput } from "../Interfaces/AcademicProgram";
import { ClassroomService } from "../Services/ClassroomService";

export class ClassroomController {
  static async CreateClassroom(req: Request, res: Response) {
    const payload = req.body as ClassroomUpsertInput;
    const newClassroom = await ClassroomService.CreateClassroom(payload, req.schema_name!);

    res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data: newClassroom,
      message: "Classroom created successfully!",
    });
  }

  static async GetAllClassrooms(req: Request, res: Response) {
    const classrooms = await ClassroomService.GetAllClassrooms(req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: classrooms,
    });
  }

  static async GetClassroomById(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const classroom = await ClassroomService.GetClassroomById(id, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: classroom,
    });
  }

  static async UpdateClassroom(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const payload = req.body as ClassroomUpsertInput;
    const updatedClassroom = await ClassroomService.UpdateClassroom(id, payload, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: updatedClassroom,
      message: "Classroom updated successfully!",
    });
  }

  static async DeleteClassroom(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    await ClassroomService.DeleteClassroom(id, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      message: "Classroom deleted successfully!",
    });
  }
}