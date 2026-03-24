import { getTenantClient } from "../Utils/prismaClient";
import { BulkCreateResult, CreateStudentBulkRequest, CreateStudentRequest } from "../Interfaces/Student";
import { Student } from "@prisma/client";
import { ConflictError, NotFoundError } from "../Types/Errors";
import bcrypt from "bcrypt";
import { StudentRepository } from "../Repositories/StudentRepository";
import { logger } from "../Utils/Logger"; 
import { MinioRepository } from "../Repositories/MinioRepository";
import { JobRepository } from "../Repositories/JobRepository";
import dotenv from 'dotenv';
import { Queues } from "../Enums/Queues";
import { QueueRepository } from "../Repositories/QueueRepository";
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

  //! don't forget to take the semester id and connect the student into fee
  public static async Create(
    data: CreateStudentRequest,
    schema_name: string
  ): Promise<Partial<Student>> {

    const prisma = getTenantClient(schema_name);
    const startTime = Date.now();

    // TODO: try to fix it because bcrypt is cpu bound (node js will not like it :-) )
    const hashed_password = await bcrypt.hash(data.nationalId, 10);

    try {
      const student: Partial<Student> = await StudentRepository.CreateStudent(data, hashed_password, prisma);

      logger.info({
        action: "StudentService.Create",
        status: "success",
        schema: schema_name,
        studentId: student.userId,
        username: data.username,
        email: data.email,
        duration_ms: Date.now() - startTime,
      });

      return student;

    } catch (err: any) {

      if (err.code === "P2002") {
        const field = err.meta?.target?.[0];

        if (field === "username") {
          logger.warn({
            action: "StudentService.Create",
            status: "failed",
            schema: schema_name,
            reason: "duplicate_username",
            username: data.username,
            duration_ms: Date.now() - startTime,
          });
          throw new ConflictError(`A student with the username '${data.username}' already exists.`);
        }

        if (field === "email") {
          logger.warn({
            action: "StudentService.Create",
            status: "failed",
            schema: schema_name,
            reason: "duplicate_email",
            email: data.email,
            duration_ms: Date.now() - startTime,
          });
          throw new ConflictError(`A student with the email '${data.email}' already exists.`);
        }

        if (field === "national_id") {
          logger.warn({
            action: "StudentService.Create",
            status: "failed",
            schema: schema_name,
            reason: "duplicate_national_id",
            nationalId: data.nationalId,
            duration_ms: Date.now() - startTime,
          });
          throw new ConflictError(`The national ID '${data.nationalId}' is already registered.`);
        }

        if (field === "university_student_id") {
          logger.warn({
            action: "StudentService.Create",
            status: "failed",
            schema: schema_name,
            reason: "duplicate_university_student_id",
            universityStudentId: data.universityStudentId,
            duration_ms: Date.now() - startTime,
          });
          throw new ConflictError(`The university student ID '${data.universityStudentId}' is already registered.`);
        }
      }

      if (err.code === "P2003") {
        logger.warn({
          action: "StudentService.Create",
          status: "failed",
          schema: schema_name,
          reason: "invalid_program_or_program_level",
          programId: data.programId,
          programLevelId: data.programLevelId,
          duration_ms: Date.now() - startTime,
        });
        throw new NotFoundError(`The Selected program Or Program Level Does Not Exist Or Is Invalid.`);
      }

      logger.error({
        action: "StudentService.Create",
        status: "failed",
        schema: schema_name,
        err: err,
        duration_ms: Date.now() - startTime,
      });

      throw err;
    }
  }

  public static async CreateBulk(
    file: Express.Multer.File,
    bulkData: CreateStudentBulkRequest,
    schema_name: string
  ) : Promise<BulkCreateResult> { 
    const objectName : string = await MinioRepository.UploadFromBuffer(file , schema_name);
    
    //! the name of the bucket will be the name of the schema
    const fileUrl = this.ConstructFileUrl(schema_name , objectName);

    const prisma = getTenantClient(schema_name);

    const jobId = await JobRepository.CreateJobRecord(fileUrl , prisma);

    const message : BulkCreateResult = {
      jobId: jobId,
      schemaName: schema_name,
      objectName,
      ...bulkData
    }; 

    await QueueRepository.Publish<BulkCreateResult>(
      Queues.StudentBulkData,
      message
    );

    return message;
  }

  static ConstructFileUrl(schema_name: string, objectName: string): string {
    return `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${schema_name}/${objectName}`;
  }
}