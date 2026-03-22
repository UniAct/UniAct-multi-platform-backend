import { Prisma, Semester, SemesterType } from "@prisma/client";
import { SemesterRepository } from "../Repositories/SemesterRepository";
import { getTenantClient } from "../Utils/prismaClient";
import { logger } from "../Utils/Logger";
import { CreateSemesterRequest, UpdateSemesterRequest } from "../Interfaces/Semester";
import { ConflictError, NotFoundError } from "../Types/Errors";

export class SemesterService {

  private static MapNumberToSemesterType(number: number): SemesterType {
    const mapping: SemesterType[] = ["Fall", "Spring", "Summer"];
    return mapping[number - 1];
  }

  public static async CreateSemester(
    data: CreateSemesterRequest,
    schema_name: string
  ): Promise<Semester> {
    const prisma = getTenantClient(schema_name);

    const exists = await SemesterRepository.SemesterExistsByYearAndNumber(
      data.year,
      data.number,
      prisma
    );

    if (exists) {
      throw new ConflictError(`Semester with year ${data.year} and number ${data.number} already exists`);
    }

    const dateConflict = await SemesterRepository.isSemesterDateOverlapping(
      new Date(data.startDate),
      new Date(data.endDate),
      prisma
    );

    if (dateConflict) {
      throw new ConflictError(`Semester dates conflict with an existing semester`);
    }

    const semesterData = {
      ...data,
      type: SemesterService.MapNumberToSemesterType(data.number)
    };

    const semester = await SemesterRepository.CreateSemester(semesterData, prisma);

    return semester;
  }

  public static async UpdateSemester(
    semesterId: number,
    data: UpdateSemesterRequest,
    schema_name: string
  ): Promise<Semester> {
    const prisma = getTenantClient(schema_name);

    const existingSemester = await SemesterRepository.GetSemesterById(semesterId, prisma);
    if (!existingSemester) {
      throw new NotFoundError(`Semester with ID ${semesterId} not found`);
    }

    const newYear = data.year !== undefined ? data.year : existingSemester.year;
    const newNumber = data.number !== undefined ? data.number : existingSemester.number;

    const exists = await SemesterRepository.SemesterExistsByYearAndNumberExcludingId(
      newYear,
      newNumber,
      semesterId,
      prisma
    );

    if (exists) {
      throw new ConflictError(`Semester with year ${newYear} and number ${newNumber} already exists`);
    }

    if (data.startDate || data.endDate) {
      const conflict = await SemesterRepository.isSemesterDateOverlapping(
        data.startDate ? new Date(data.startDate) : existingSemester.startDate,
        data.endDate ? new Date(data.endDate) : existingSemester.endDate,
        prisma,
        semesterId
      );

      if (conflict) {
        throw new ConflictError(`Semester dates conflict with an existing semester`);
      }
    }

    const updatedData: Prisma.SemesterUpdateInput = {
      ...data,
      type: SemesterService.MapNumberToSemesterType(newNumber)
    };

    return await SemesterRepository.UpdateSemester(semesterId, updatedData, prisma);
  }

  public static async DeleteSemester(
    semesterId: number,
    schema_name: string
  ): Promise<Semester> {
    const prisma = getTenantClient(schema_name);
    
    return await SemesterRepository.DeleteSemester(semesterId, prisma);
  }

  public static async GetAllSemesters(
    schema_name: string
  ): Promise<Semester[]> {
    const prisma = getTenantClient(schema_name);
    const semesters = await SemesterRepository.GetAllSemesters(prisma);
    
    logger.info({
        action: "SemesterService.GetAllSemesters",
        status: "success",
        schema: schema_name,
        count: semesters.length
      });

    return semesters;
  }

  public static async GetSemesterById(
    semesterId: number,
    schema_name: string
  ): Promise<Semester> {
    const prisma = getTenantClient(schema_name);

    const semester = await SemesterRepository.GetSemesterById(semesterId, prisma);

    if (!semester) {
      logger.warn({
        action: "SemesterService.GetSemesterById",
        status: "failed",
        schema: schema_name,
        semesterId,
        reason: "semester not found"
      });
      throw new NotFoundError(`Semester with ID ${semesterId} not found`);
    }

    logger.info({
      action: "SemesterService.GetSemesterById",
      status: "success",
      schema: schema_name,
      semesterId,
      year: semester.year,
      number: semester.number,
      type: semester.type
    });

    return semester;
  }
}