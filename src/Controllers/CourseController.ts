import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { CourseUpsertInput } from "../Interfaces/AcademicProgram";
import { CourseService } from "../Services/CourseService";
import { CreateCourse } from "../Validators/CourseValidator";
import { AssignCourseAssessmentBodyType } from "../Interfaces/Course/AssignCourseAssessment/AssignCourseAssessmentSchema";
import { UpdateStudentGradeBodyType } from "../Interfaces/Course/UpdateStudentGrade/UpdateStudentGradeSchema";
import { UpdateCourseAssessmentBodyType } from "../Interfaces/Course/UpdateCourseAssessment/UpdateCourseAssessmentSchema";
import { CreateCourseAssessmentBodyType } from "../Interfaces/Course/CreateCourseAssessment/CreateCourseAssessmentSchema";

export class CourseController {
  static async CreateCourse(req: Request, res: Response) {
    const payload = req.body as CreateCourse;
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

  static async GetAllStaffCourses(req: Request, res: Response) {
    const staffId = parseInt(req.params.staffId as string);

    const dto = await CourseService.GetAllStaffCourses(staffId, req.schema_name!, req.user!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: dto,
    });
  }

  static async AssignCourseAssessment(req: Request, res: Response) {
    const courseId = parseInt(req.params.courseId as string);
    const body     = req.body as AssignCourseAssessmentBodyType;

    const dto = await CourseService.AssignCourseAssessment(courseId, body, req.schema_name!, req.user!);

    res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data:   dto,
    });
  }

  static async CreateCourseAssessment(req: Request, res: Response) {
    const courseId = parseInt(req.params.courseId as string);
    const body = req.body as CreateCourseAssessmentBodyType;

    const dto = await CourseService.CreateCourseAssessment(courseId, body, req.schema_name!, req.user!);

    res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data: dto,
    });
  }

  static async GetCourseStudents(req: Request, res: Response) {
    const courseId = parseInt(req.params.courseId as string);

    const dto = await CourseService.GetCourseStudents(courseId, req.schema_name!, req.user!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data:   dto,
    });
  }

  static async UpdateStudentGrade(req: Request, res: Response) {
    const gradeId = parseInt(req.params.gradeId as string);
    const body    = req.body as UpdateStudentGradeBodyType;

    const dto = await CourseService.UpdateStudentGrade(gradeId, body, req.schema_name!, req.user!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data:   dto,
    });
  }

  static async GetCourseAssessment(req: Request, res: Response) {
    const courseId = parseInt(req.params.courseId as string);

    const dto = await CourseService.GetCourseAssessment(courseId, req.schema_name!, req.user!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data:   dto,
    });
  }

  static async UpdateCourseAssessment(req: Request, res: Response) {
    const courseId = parseInt(req.params.courseId as string);
    const body     = req.body as UpdateCourseAssessmentBodyType;

    const dto = await CourseService.UpdateCourseAssessment(courseId, body, req.schema_name!, req.user!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data:   dto,
    });
  }

  static async DeleteCourseAssessment(req: Request, res: Response) {
    const assessmentId = parseInt(req.params.assessmentId as string);

    const dto = await CourseService.DeleteCourseAssessment(assessmentId, req.schema_name!, req.user!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: dto,
    });
  }
}
