import { Prisma, University, Tenant } from "../generated/public";
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { TenantRepository } from "../Repositories/TenantRepository";
import { Pool } from "pg";
import { SchemaManager } from "../Utils/SchemaManager";

export class UniversityService {
  public static async Create(
    data: Prisma.UniversityCreateInput
  ): Promise<University> {
    const existingUniversity = await UniversityRepository.GetByName(data.name);
    if (existingUniversity) {
      throw new Error(`University with name "${data.name}" already exists.`);
    }

    const university = await UniversityRepository.Create(data);
    console.log(`[INFO] University created successfully: ${university.name}`);
    return university;
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

  public static async GetByNameWithTenants(id: number): Promise<University> {
    const university = await UniversityRepository.GetByIdWithTenants(id);
    if (!university) 
      throw new Error(`University with ID ${id} not found.`);

    return university;
  }

  public static async GetWithTenants(university_name: string) : Promise<(University & { tenants: Tenant[] })> {
    const university = await UniversityRepository.GetByNameWithTenants(university_name);
    if (!university) 
      throw new Error(`University with name ${university_name} not found.`);

    return university;
  }

  public static async GetAll(): Promise<University[]> {
    return await UniversityRepository.GetAll();
  }

  public static async DeleteUniversity(id: number): Promise<University> {
    const university = await UniversityRepository.GetById(id);
    if (!university) 
      throw new Error(`University with ID ${id} not found.`);

    await UniversityRepository.Delete(id);
    console.log(`[INFO] University deleted: ${university.name}`);
    return university;
  }

  public static async GetTenants(university_id: number): Promise<Tenant[]> {
    const university = await UniversityRepository.GetById(university_id);
    if (!university) {
      throw new Error(`University with ID ${university_id} not found.`);
    }
    return await UniversityRepository.GetTenants(university_id);
  }

  public static async AssignUniversityToTenant(
    tenant_id: number,
    university_id: number
  ): Promise<Tenant> {
    const tenant = await TenantRepository.GetById(tenant_id);
    if (!tenant) 
      throw new Error(`Tenant with ID ${tenant_id} not found.`);

    const university = await UniversityRepository.GetById(university_id);
    if (!university) 
      throw new Error(`University with ID ${university_id} not found.`);

    const updatedTenant = await UniversityRepository.AssignTenant(tenant_id, university_id);

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    const schema_manager = new SchemaManager(pool);

    await schema_manager.CreateSchema(tenant.db_schema);
    
    console.log(`[INFO] Tenant ${updatedTenant.name} assigned to university ${university.name}`);
    return updatedTenant;
  }
}
