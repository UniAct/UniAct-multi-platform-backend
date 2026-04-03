import { GetTenantClient } from "../Utils/prismaClient";
import { BulkCreateResult, CreateStudentBulkRequest, CreateStudentRequest, StudentQuery, UpdateStudentRequest } from "../Interfaces/Student";
import { Student } from "@prisma/client";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../Types/Errors";
import bcrypt from "bcrypt";
import { StudentRepository } from "../Repositories/StudentRepository";
import { logger } from "../Utils/Logger"; 
import { MinioRepository } from "../Repositories/MinioRepository";
import { JobRepository } from "../Repositories/JobRepository";
import dotenv from 'dotenv';
import { Queues } from "../Enums/Queues";
import { QueueRepository } from "../Repositories/QueueRepository";
import { IPage } from "../Interfaces/Common/PaginatedList";
import { StudentListItem } from "../Types/StudentList";
import { ProgramRepository } from "../Repositories/ProgramRepository";
import { MapUpdatedStudent, UpdatedStudentResponseDto } from "../Interfaces/Student/UpdateStudent/UpdateMapper";
import { UpdateStudentRequestDto } from "../Interfaces/Student/UpdateStudent/UpdateSchema";
import { CreateStudentRequestDto } from "../Interfaces/Student/CreateStudent/CreateSchema";
import { CreateStudentResponseDto, MapCreateStudent } from "../Interfaces/Student/CreateStudent/CreateMapper";
import { CreateStudentBulkRequestDto } from "../Interfaces/Student/CreateStudent/CreateBulkSchema";
import { DeleteStudentResponseDto, MapDeleteStudent } from "../Interfaces/Student/DeleteStudent/DeleteMapper";
import { StudentQueryDto } from "../Interfaces/Student/GetStudentPage/QuerySchema";
import { GetStudentItemResponseDto, MapGetStudentPage } from "../Interfaces/Student/GetStudentPage/GetMapper";
dotenv.config();

export class StudentService {
  /**
   * NOTE:
   * Previously, the creation logic performed multiple queries to check for existing username, email,
   * national ID, university ID, and the validity of program & program level (about 7 queries in total)
   * before actually inserting the student. While that approach is very explicit, it significantly
   * slows down the endpoint due to extra round-trips to the database.
   *
   * The current approach leverages database constraints (unique indexes and foreign key constraints)
   * to handle these validations. We rely on catching Prisma errors (P2002 for unique violations,
   * P2003 for foreign key violations) to produce business-friendly messages.
   *
   * Pros of this approach:
   * - Fewer database queries, faster endpoint response
   * - Centralized constraint enforcement in the DB
   * - Simpler and cleaner code in the service layer
   *
   * Cons / Considerations:
   * - Errors are thrown only after the attempt to insert, so we need proper catch handling
   * - bcrypt hashing is still CPU-bound, so very large batches may need async throttling
   *
   * Overall, this balances performance with clarity and maintains business rules in a readable way.
   * 
   * 
   * NOTE:
   * If your endpoint performs many validations and each one results in a separate query to the database,
   * consider moving these checks into the database itself using constraints (unique indexes, foreign keys, etc.).
   * Let the database enforce the rules — this reduces round-trips, improves performance, and simplifies your service logic.
   */

  public static async Create(
    data: CreateStudentRequestDto,
    schema_name: string
  ): Promise<CreateStudentResponseDto> {

    const prisma = GetTenantClient(schema_name);
    const startTime = Date.now();

    const hashed_password = await bcrypt.hash(data.nationalId, 10);

    try {
      const student = await StudentRepository.CreateStudent(data, hashed_password, prisma);

      logger.info({
        action: "StudentService.Create",
        status: "success",
        schema: schema_name,
        studentId: student.user.id,
        username: data.username,
        email: data.email,
        duration_ms: Date.now() - startTime,
      });

      const response : CreateStudentResponseDto = MapCreateStudent(student);

      return response;
    } 
    catch (err: any) {
      StudentRepository.HandleCreateError(err, schema_name, data, Date.now() - startTime);
    }
  }

  public static async CreateBulk(
    file: Express.Multer.File,
    bulkData: CreateStudentBulkRequestDto,
    schemaName: string
  ) : Promise<BulkCreateResult> { 
    const objectName : string = await MinioRepository.UploadFromBuffer(file , schemaName);
    
    //! the name of the bucket is the name of the schema
    const fileUrl = this.ConstructFileUrl(schemaName , objectName);

    const prisma = GetTenantClient(schemaName);

    const jobId = await JobRepository.CreateJobRecord(fileUrl , prisma);

    const message : BulkCreateResult = {
      jobId: jobId,
      schemaName: schemaName,
      objectName,
      ...bulkData
    }; 

    await QueueRepository.Publish<BulkCreateResult>(
      Queues.StudentBulkData,
      message
    );

    return message;
  }

  public static async Delete(
    studentId: number,
    schema_name: string
  ) : Promise<DeleteStudentResponseDto> {
    const startTime = Date.now();
    const prisma = GetTenantClient(schema_name);

    try {
      const student : DeleteStudentResponseDto = MapDeleteStudent(await StudentRepository.Delete(studentId, prisma));

      logger.info({
        action: "StudentService.Delete",
        status: "success",
        schema: schema_name,
        studentId,
        duration_ms: Date.now() - startTime,
      });

      return student;
    } catch (err: any) {
      StudentRepository.HandleActivateOrDeleteError(err ,schema_name , studentId , Date.now() - startTime , "StudentService.Delete");
    }
  }

  public static async Activate(
    studentId: number,
    schema_name: string
  ) : Promise<void> {
    const startTime = Date.now();
    const prisma = GetTenantClient(schema_name);

    try {
      await StudentRepository.Activate(studentId, prisma);

      logger.info({
        action: "StudentService.Activate",
        status: "success",
        schema: schema_name,
        studentId,
        duration_ms: Date.now() - startTime,
      });

    } catch (err: any) {
      StudentRepository.HandleActivateOrDeleteError(err ,schema_name , studentId , Date.now() - startTime , "StudentService.Activate");
    }
  }

  public static async GetAll(
    filters: StudentQueryDto,
    schemaName: string
  ): Promise<IPage<GetStudentItemResponseDto>> {
    const startTime = Date.now();
    const prisma    = GetTenantClient(schemaName);

    try {
      const result = MapGetStudentPage(await StudentRepository.GetAll(filters, prisma));

      logger.info({
        action:      "StudentService.GetAll",
        status:      "success",
        schema:      schemaName,
        totalCount:  result.totalCount,
        pageNumber:  filters.page,
        duration_ms: Date.now() - startTime,
      });

      return result;

    } catch (err: any) {
      logger.error({
        action:      "StudentService.GetAll",
        status:      "error",
        schema:      schemaName,
        error:       err.message,
        duration_ms: Date.now() - startTime,
      });
      throw new InternalServerError();
    }
  }

  public static async Update(
    studentId: number,
    data: UpdateStudentRequestDto,
    schemaName: string
  ) : Promise<UpdatedStudentResponseDto> {
    const prisma = GetTenantClient(schemaName);
    const startTime = Date.now();

    try {

      if (data.programId !== undefined && data.programLevelId !== undefined) {
        const isValid = await ProgramRepository.IsProgramLevelBelongsToProgram(
          data.programLevelId,
          data.programId,
          prisma
        );

        if (!isValid) {
          logger.warn({
            action:         "StudentService.Update",
            status:         "failed",
            schema:         schemaName,
            reason:         "program_level_not_in_program",
            programId:      data.programId,
            programLevelId: data.programLevelId,
            duration_ms:    Date.now() - startTime,
          });
          throw new BadRequestError(
            `Program level '${data.programLevelId}' does not belong to program '${data.programId}'.`
          );
        }
      }

      // Flatten the nested Prisma result (user + student) (database model) into a single response shape (client model) before returning to the client.
      const updatedStudent : UpdatedStudentResponseDto = MapUpdatedStudent(await StudentRepository.Update(studentId, data, prisma));

      logger.info({
        action:      "StudentService.Update",
        status:      "success",
        schema:      schemaName,
        studentId:   studentId,
        duration_ms: Date.now() - startTime,
      });

      return updatedStudent;

    } catch (err: any) {
      StudentRepository.HandleUpdateError(err, studentId, data, schemaName, startTime);
    }
  }

  
  static ConstructFileUrl(schema_name: string, objectName: string): string {
    return `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${schema_name}/${objectName}`;
  }
}
