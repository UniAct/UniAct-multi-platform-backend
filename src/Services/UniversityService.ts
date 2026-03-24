import { Prisma, PrismaClient, University } from "@prisma/client"
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { Pool } from "pg";
import { SchemaManager } from "../Utils/SchemaManager";
import { getTenantClient } from "../Utils/prismaClient";
import { NotFoundError } from "../Types/Errors";
import { logger } from "../Utils/Logger";
import { MinioRepository } from "../Repositories/MinioRepository";

export class UniversityService {

  public static async Create(
    data: Prisma.UniversityCreateInput,
  ): Promise<University> {

    const prisma = getTenantClient("public");

    const university = await UniversityRepository.Create(data, prisma);

    try {

      await SchemaManager.createTenant(university.db_schema);

      logger.info(
        {
          action: "UniversityService.Create",
          university_name: university.name,
          status: "success"
        }
      );

      await MinioRepository.CreateBucket(university.db_schema);

      return university;
    } catch (err) {
      throw err;
    }
  }

  public static async GetById(id: number): Promise<University> {

    const prisma = getTenantClient("public");
    const university = await UniversityRepository.GetById(id, prisma);
    if (!university)
      throw new NotFoundError(`University with Id ${id} not found.`);

    return university;
  }

  public static async GetByName(university_name: string,): Promise<University> {

    const prisma = getTenantClient("public");
    const university = await UniversityRepository.GetByName(university_name, prisma);

    if (!university)
      throw new NotFoundError(`University with name '${university_name}' not found.`);

    return university;
  }

  public static async GetUniversityBySchemaName(db_schema: string): Promise<University> {

    const prisma = getTenantClient("public");
    const university = await UniversityRepository.GetUniversityBySchemaName(db_schema, prisma);

    if (!university)
      throw new NotFoundError(`University with schema '${db_schema}' not found.`);

    return university;
  }

  public static async ListNames(): Promise<string[]> {

    const prisma = getTenantClient("public");
    return await UniversityRepository.ListNames(prisma);
  }

  public static async GetAll(): Promise<University[]> {

    const prisma = getTenantClient("public");
    return await UniversityRepository.GetAll(prisma);
  }

  public static async DeleteUniversity(id: number,): Promise<University> {

    const prisma = getTenantClient("public");
    const university = await UniversityRepository.GetById(id, prisma);

    if (!university) {
      throw new NotFoundError(`University with ID ${id} not found.`);
    }

    await UniversityRepository.Delete(id, prisma);


    await SchemaManager.deleteSchema(university.db_schema);

    await MinioRepository.DeleteBucket(university.db_schema);

    logger.info(
      {
        action: "UniversityService.DeleteUniversity",
        university_name: university.name,
        status: "success"
      }
    );
    return university;
  }

  public static async Activate(id: number,): Promise<University> {

    const prisma = getTenantClient("public");
    const university = await UniversityRepository.GetById(id, prisma);
    if (!university) {
      throw new NotFoundError(`University with id '${id}' does not exist`);
    }

    return await UniversityRepository.Activate(id, prisma);
  }

  public static async Deactivate(id: number,): Promise<University> {

    const prisma = getTenantClient("public");
    const university = await UniversityRepository.GetById(id, prisma);
    if (!university) {
      throw new NotFoundError(`University with id '${id}' does not exist`);
    }

    return await UniversityRepository.Deactivate(id, prisma);
  }


}
