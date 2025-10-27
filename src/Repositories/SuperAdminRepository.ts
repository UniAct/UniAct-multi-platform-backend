import { User } from "../generated/tenants/alexandria_national_university";
import {PrismaClient , SuperAdmin, Tenant, University} from "../generated/public"
import { SchemaManager } from "../Utils/SchemaManager";
import { UniversityService } from "../Services/UniversityService";
import { TransactionService } from "../Services/Transaction";

const public_schema = new PrismaClient();

class SuperAdminRepository {
  public static async Create(
    username: string,
    email: string,
    password: string
  ): Promise<SuperAdmin> {
    try {
      const newSuperAdmin : SuperAdmin = await public_schema.superAdmin.create({
        data: {
          username,
          email,
          password,
        },
      });

      return newSuperAdmin;
    } catch (err: any) {
      console.error("Error Creating SuperAdmin:", err);
      throw err;
    }
  }

  public static async FindByEmail(email: string): Promise<SuperAdmin | null> {
    return await public_schema.superAdmin.findUnique({
      where: { email },
    });
  }

  public static async FindByUsername(username: string): Promise<SuperAdmin | null> {
    return await public_schema.superAdmin.findUnique({
      where: { username },
    });
  }

  public static async IsExists(username: string, email: string): Promise<SuperAdmin | null> {
      return await public_schema.superAdmin.findFirst({
          where: {
              OR: [
                  { username },
                  { email }
              ]
          }
      });

  }

  public static async GetAllSuperAdmins(): Promise<SuperAdmin[]> {
    try {
      return await public_schema.superAdmin.findMany({
        orderBy: { username: "asc" },
      });
    } catch (err: any) {
      console.error("Error Fetching SuperAdmins:", err);
      throw err;
    }
  }

  public static async ActivateSuperAdmin(email: string): Promise<SuperAdmin> {
    try {
      const admin = await public_schema.superAdmin.update({
        where: { email },
        data: { is_active: true },
      });
      return admin;
    } catch (err: any) {
      console.error("Error Activating SuperAdmin:", err);
      throw err;
    }
  }

  public static async DeleteSuperAdmin(username: string): Promise<SuperAdmin> {
    try {
      const deletedAdmin = await public_schema.superAdmin.delete({
        where: { username },
      });
      return deletedAdmin;
    } catch (err: any) {
      console.error("Error Deleting SuperAdmin:", err);
      throw err;
    }
  }

  public static async CountSuperAdmins() : Promise<number> {
    return await public_schema.superAdmin.count();
  }

  public static async AssignRootAccount(
    university_name: string,
    user: Partial<User>
  ) {
    try {
      const university_with_tenants : University & { tenants: Tenant[] } 
        = await UniversityService.GetWithTenants(university_name);

      if (!university_with_tenants) throw new Error(`University '${university_name}' not found`);
      if (!university_with_tenants.tenants || university_with_tenants.tenants.length === 0)
        throw new Error(`No tenant schema found for university '${university_name}'`);

      const FIRST_TENANT_SCHEMA = 0;
      const tenant = university_with_tenants.tenants[FIRST_TENANT_SCHEMA];

      const root_account = await TransactionService.CreateRootAccount(user , tenant.db_schema);

      return root_account;
    } catch (err: any) {
      console.error("Error Assigning Root Account:", err);
      throw err;
    }
  }

  public static async ActivateRootAccount(email: string, university_name: string) {
    try {
      const university = await public_schema.university.findUnique({
        where: { name: university_name },
        include: { tenants: true },
      });

      if (!university) 
        throw new Error(`University '${university_name}' not found`);
      

      const tenant = university.tenants[0];

      if (!tenant) 
        throw new Error(`No tenant found for university '${university_name}'`);
      

      const tenant_schema = SchemaManager.GetTenantPrismaClient(tenant.db_schema);

      const root_account = await tenant_schema.user.update({
        where: { email },
        data: { isVerified: true },
      });

      return root_account;
    } catch (err: any) {
      console.error("Error Activating Root Account:", err);
      throw err;
    }
  }
}

export default SuperAdminRepository;
