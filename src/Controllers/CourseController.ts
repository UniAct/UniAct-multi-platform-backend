import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { CourseUpsertInput } from "../Interfaces/AcademicProgram";
import { CourseService } from "../Services/CourseService";

export class CourseController {
  static async CreateCourse(req: Request, res: Response) {
    const payload = req.body as CourseUpsertInput;
    const newCourse = await CourseService.CreateCourse(payload, req.schema_name!);

    res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data: newCourse,
      message: "Course created successfully!",
    });
  }

  static async GetAllCourses(req: Request, res: Response) {
    const courses = await CourseService.GetAllCourses(req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: courses,
    });
  }

  static async GetCourseById(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const course = await CourseService.GetCourseById(id, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: course,
    });
  }

  static async UpdateCourse(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    const payload = req.body as CourseUpsertInput;
    const updatedCourse = await CourseService.UpdateCourse(id, payload, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: updatedCourse,
      message: "Course updated successfully!",
    });
  }

  static async DeleteCourse(req: Request, res: Response) {
    const id = parseInt(req.params.id as string);
    await CourseService.DeleteCourse(id, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: { message: "Course deleted successfully" },
    });
  }
}
