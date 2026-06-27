// src/services/enrollment-window.service.ts
import { NotFoundError } from "../Types/Errors";
import { GetTenantClient } from "../Utils/prismaClient";
import { logger } from "../Utils/Logger";
import { CreateEnrollmentWindowInput, FindEnrollmentWindowQuery, UpdateEnrollmentWindowInput } from "../Interfaces/Enrollment-Window/EnrollmentWindow";
import { EnrollmentWindowRepository } from "../Repositories/EnrollmentWindowRepository";


export class EnrollmentWindowService {

  // 1. Create a new Enrollment Window Rule
  static async CreateEnrollmentWindow(windowData: CreateEnrollmentWindowInput, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    const newWindow = await EnrollmentWindowRepository.CreateEnrollmentWindow(windowData, prisma);

    logger.info({
      action: "EnrollmentWindowService.CreateEnrollmentWindow",
      window_id: newWindow.id,
      window_name: newWindow.name,
      status: "success"
    });

    return newWindow;
  }


  static async GetEnrollmentWindowById(id: number, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    const window = await EnrollmentWindowRepository.GetEnrollmentWindowById(id, prisma);

    if (!window) {
      throw new NotFoundError("There is no Enrollment Window with this Id");
    }

    return window;
  }

  static async FindConfiguredEnrollmentWindow(query: FindEnrollmentWindowQuery, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    return EnrollmentWindowRepository.FindConfiguredWindow(
      {
        facultyId: query.facultyId,
        semesterId: query.semesterId,
        programLevelId: query.programLevelId,
        programId: query.programId ?? null,
      },
      prisma,
    );
  }

  // 3. Update an existing Enrollment Window Rule
  static async UpdateEnrollmentWindow(id: number, windowData: UpdateEnrollmentWindowInput, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    
    const updatedWindow = await EnrollmentWindowRepository.UpdateEnrollmentWindow(id, windowData, prisma);

    logger.info({
      action: "EnrollmentWindowService.UpdateEnrollmentWindow",
      window_id: id,
      status: "success"
    });

    return updatedWindow;
  }

  // 4. Delete an Enrollment Window Rule
  static async DeleteEnrollmentWindow(id: number, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    const deletedWindow = await EnrollmentWindowRepository.DeleteEnrollmentWindow(id, prisma);

    if (!deletedWindow) {
      throw new NotFoundError("There is no Enrollment Window with this Id");
    }

    logger.info({
      action: "EnrollmentWindowService.DeleteEnrollmentWindow",
      window_id: id,
      status: "success"
    });
  }
}
