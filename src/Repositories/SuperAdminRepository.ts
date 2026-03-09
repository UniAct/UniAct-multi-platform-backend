import { User } from "../generated/tenants/anu";
import {PrismaClient , SuperAdmin, University} from "../generated/public"
import { SchemaManager } from "../Utils/SchemaManager";
import { UniversityService } from "../Services/UniversityService";
import { TransactionService } from "../Services/Transaction";
import { UniversityRepository } from "./UniversityRepository";
import { MailService } from "../Services/MailService/MailService";

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
    db_schema: string,
    user: Partial<User>
  ) {
    try {

      const root_account = await TransactionService.CreateRootAccount(
        user,
        db_schema
      );

      await MailService.SendVerificationRootAccountMail(user.email! , db_schema);

      return root_account;
    } catch (err: any) {
      console.error("Error Assigning Root Account:", err);
      throw err;
    }
  }

  public static async ActivateRootAccount(email: string, university_name: string) {
    try {
      const university = await public_schema.university.findUnique({
        where: { name: university_name }
      });

      if (!university) 
        throw new Error(`University '${university_name}' not found`);

      const db_schema = university.db_schema;

      const tenant_schema = SchemaManager.GetTenantPrismaClient(db_schema);

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
