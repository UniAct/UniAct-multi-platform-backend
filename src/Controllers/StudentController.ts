import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { CreateStudentBulkRequest, CreateStudentRequest } from "../Interfaces/Student";
import { StudentService } from "../Services/StudentService";

export class StudentController {
  
  static async Create(req: Request, res: Response) {
      const studentData: CreateStudentRequest = req.body as CreateStudentRequest;

      const newStudent = await StudentService.Create(studentData, req.schema_name!);

      res.status(StatusCodes.CREATED).json({
          status: JSendStatus.SUCCESS,
          data: newStudent,
          message: "Student Created Successfully!",
      });
  }

  static async CreateBulk(req: Request, res: Response) {
    const file: Express.Multer.File = req.excelFile!;
    const schema_name: string = req.schema_name!;
    const bulkData = req.body as CreateStudentBulkRequest;
    
    const { jobId } = await StudentService.CreateBulk(file , bulkData , schema_name);

    res.status(StatusCodes.ACCEPTED).json({
      status: JSendStatus.SUCCESS,
      data: {
        message: "Your File Has Been Received And Is Being Processed. Students Will Be Added To The System Shortly.",
        jobId
      }
    });
  }

  public static async Delete(req: Request, res: Response): Promise<void> {
    const studentId = Number(req.params.id);
    const schemaName: string = req.schema_name!;

    const student = await StudentService.Delete(studentId, schemaName);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      message: "Student account has been deactivated successfully.",
      data: { student },
    });
  }
}