import { Prisma } from "@prisma/client";
import { CourseUpsertInput } from "../Interfaces/AcademicProgram";
import { CourseRepository } from "../Repositories/CourseRepository";
import { NotFoundError } from "../Types/Errors";
import { GetTenantClient } from "../Utils/prismaClient";
import { CreateCourse, UpdateCourse } from "../Validators/CourseValidator";

export class CourseService {

  public static async CreateCourse(payload: CreateCourse, schema_name: string) {
    const prisma = GetTenantClient(schema_name);

      return CourseRepository.CreateCourse(payload, prisma);
  }

  public static async GetAllCourses(schema_name: string) {
    const prisma = GetTenantClient(schema_name);

    return CourseRepository.GetAllCourses(prisma);
  }

  public static async GetCourseById(id: number, schema_name: string) {
    const prisma = GetTenantClient(schema_name);

    const course = await CourseRepository.GetCourseById(id, prisma);

    if (!course) {
      throw new NotFoundError("This course doesn't exist");
    }

    return course;
  }

  public static async UpdateCourse(id: number, payload: UpdateCourse, schema_name: string) {
  const prisma = GetTenantClient(schema_name);

  // to check if it exists or not 
    await this.GetCourseById(id, schema_name)

  return await CourseRepository.UpdateCourse(id,payload,prisma);

}

  public static async DeleteCourse(id: number, schema_name: string) {
    const prisma = GetTenantClient(schema_name);

      return CourseRepository.DeleteCourse(id, prisma);
    };
  }

