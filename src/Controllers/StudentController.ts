import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { StudentService } from "../Services/StudentService";
import { IPage } from "../Interfaces/Common/PaginatedList";
import { UpdateStudentRequestDto } from "../Interfaces/Student/UpdateStudent/UpdateSchema";
import { CreateStudentRequestDto } from "../Interfaces/Student/CreateStudent/CreateSchema";
import { CreateStudentBulkRequestDto } from "../Interfaces/Student/CreateStudent/CreateBulkSchema";
import { StudentQueryDto} from "../Interfaces/Student/GetStudentPage/QuerySchema";
import { GetStudentItemResponseDto } from "../Interfaces/Student/GetStudentPage/GetMapper";

export class StudentController {
  
  static async Create(req: Request, res: Response) {
      const studentData: CreateStudentRequestDto = req.body;

      const student = await StudentService.Create(studentData, req.schema_name!);

      res.status(StatusCodes.CREATED).json({
          status: JSendStatus.SUCCESS,
          message: "Student Created Successfully!",
          date: {
            student
          }
      });
  }

  static async CreateBulk(req: Request, res: Response) {
    const file: Express.Multer.File = req.excelFile!;
    const schema_name: string = req.schema_name!;
    const bulkData : CreateStudentBulkRequestDto = req.body;
    
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

  public static async Activate(req: Request, res: Response): Promise<void> {
    const studentId = Number(req.params.id);
    const schemaName: string = req.schema_name!;

    await StudentService.Activate(studentId, schemaName);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      message: "Student account has been activated successfully.",
    });
  }

  public static async GetAll(req: Request, res: Response): Promise<void> {
    const filters : StudentQueryDto =req.query;
    const schemaName = req.schema_name!;

    const result: IPage<GetStudentItemResponseDto> = await StudentService.GetAll(filters, schemaName);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: {
        students: result.items,
        pagination: {
          totalCount: result.totalCount,
          pageNumber:  result.pageNumber,
          pageSize:    result.pageSize,
          totalPages:  result.totalPages,
        },
      },
    });
  }

  public static async Update(req : Request , res : Response){
    const studentId = Number(req.params!.id);
    const studentData : UpdateStudentRequestDto = req.body; 
    const schemaName = req.schema_name!;

    const updatedStudent = await StudentService.Update(studentId , studentData , schemaName);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: {
        message: "Student Updated Successfully",
        data : updatedStudent
      }
    });
  }
}