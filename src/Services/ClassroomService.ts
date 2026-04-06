import { Prisma } from "@prisma/client";
import { ClassroomUpsertInput } from "../Interfaces/AcademicProgram";

import { NotFoundError } from "../Types/Errors";
import { ClassroomRepository } from "../Repositories/ClassroomRepository";

export class ClassroomService {
  private static buildCreateData(payload: ClassroomUpsertInput): Prisma.ClassroomCreateInput {
    return {
      roomNumber: payload.roomNumber,
      building: payload.building,
      capacity: payload.capacity,
      type: payload.type,
      isAvailable: payload.isAvailable ?? true,
    };
  }

  public static async CreateClassroom(payload: ClassroomUpsertInput, schema_name: string) {
    return ClassroomRepository.WithTransaction(schema_name, async (tx) => {
      return ClassroomRepository.CreateClassroom(this.buildCreateData(payload), tx);
    });
  }

  public static async GetAllClassrooms(schema_name: string) {
    return ClassroomRepository.GetAllClassroomsBySchema(schema_name);
  }

  public static async GetClassroomById(id: number, schema_name: string) {
    const classroom = await ClassroomRepository.GetClassroomByIdFromSchema(id, schema_name);

    if (!classroom) {
      throw new NotFoundError("Classroom not found");
    }

    return classroom;
  }

  public static async UpdateClassroom(id: number, payload: ClassroomUpsertInput, schema_name: string) {
    return ClassroomRepository.WithTransaction(schema_name, async (tx) => {
      const existingClassroom = await ClassroomRepository.GetClassroomById(id, tx);
      if (!existingClassroom) {
        throw new NotFoundError("Classroom not found");
      }

      return ClassroomRepository.UpdateClassroom(id, this.buildCreateData(payload), tx);
    });
  }

  public static async DeleteClassroom(id: number, schema_name: string) {
    return ClassroomRepository.WithTransaction(schema_name, async (tx) => {
      const existingClassroom = await ClassroomRepository.GetClassroomById(id, tx);
      if (!existingClassroom) {
        throw new NotFoundError("Classroom not found");
      }

      return ClassroomRepository.DeleteClassroom(id, tx);
    });
  }
}
