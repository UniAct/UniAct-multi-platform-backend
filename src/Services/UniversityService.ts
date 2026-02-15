import { Prisma, University } from "../generated/public";
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { Pool } from "pg";
import { SchemaManager } from "../Utils/SchemaManager";

export class UniversityService {
  public static async Create(
    data: Prisma.UniversityCreateInput
  ): Promise<University> {

    const existingByName = await UniversityRepository.GetByName(data.name);
    if (existingByName) {
      throw new Error(`University with name "${data.name}" already exists.`);
    }

    const existingBySchema = await UniversityRepository.GetBySchema(data.db_schema);
    if (existingBySchema) {
      throw new Error(
        `University with db_schema "${data.db_schema}" already exists.`
      );
    }

    const university = await UniversityRepository.Create(data);

    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      const schemaManager = new SchemaManager(pool);
      await schemaManager.CreateSchema(university.db_schema);

      console.log(
        `[INFO] University created successfully: ${university.name}`
      );

      return university;
    } catch (err) {
      throw err;
    }
  }

  public static async GetById(id: number): Promise<University> {
    const university = await UniversityRepository.GetById(id);
    if (!university) 
      throw new Error(`University with Id ${id} not found.`);

    return university;
  }

  public static async GetByName(university_name: string): Promise<University> {
    const university = await UniversityRepository.GetByName(university_name);
    if (!university) 
      throw new Error(`University with name ${university} not found.`);

    return university;
  }

  public static async ListNames(): Promise<string[]> {
    return await UniversityRepository.ListNames();
  }

  public static async GetAll(): Promise<University[]> {
    return await UniversityRepository.GetAll();
  }

  public static async DeleteUniversity(id: number): Promise<University> {
    const university = await UniversityRepository.GetById(id);
    if (!university) 
      throw new Error(`University with ID ${id} not found.`);
      
    
    await UniversityRepository.Delete(id);
    
    // delete the schema of that university
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    const schema_manager = new SchemaManager(pool);
    await schema_manager.DeleteSchema(university.db_schema);

    console.log(`[INFO] University deleted: ${university.name}`);
    return university;
  }

  public static async Activate(id: number): Promise<University> {
    const university = await UniversityRepository.GetById(id);
    if (!university) {
      throw new Error(`University with id '${id}' does not exist`);
    }

    return await UniversityRepository.Activate(id);
  }

  public static async Deactivate(id: number): Promise<University> {
    const university = await UniversityRepository.GetById(id);
    if (!university) {
      throw new Error(`University with id '${id}' does not exist`);
    }

    return await UniversityRepository.Deactivate(id);
  }

  
}
