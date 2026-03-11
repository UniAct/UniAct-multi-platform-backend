import {Prisma, PrismaClient, SuperAdmin} from "@prisma/client"
import { TransactionService } from "../Services/Transaction";
import { MailService } from "../Services/MailService/MailService";
import { getTenantClient } from "../Utils/prismaClient";


class SuperAdminRepository {
  public static async Create(
    username: string,
    email: string,
    password: string,
    prisma:PrismaClient
  ): Promise<SuperAdmin> {
    try {
      const newSuperAdmin : SuperAdmin = await prisma.superAdmin.create({
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

  public static async FindByEmail(email: string,prisma:PrismaClient): Promise<SuperAdmin | null> {
    return await prisma.superAdmin.findUnique({
      where: { email },
    });
  }

  public static async FindByUsername(username: string, prisma:PrismaClient): Promise<SuperAdmin | null> {
    return await prisma.superAdmin.findUnique({
      where: { username },
    });
  }

  public static async IsExists(username: string, email: string, prisma:PrismaClient): Promise<SuperAdmin | null> {
      return await prisma.superAdmin.findFirst({
          where: {
              OR: [
                  { username },
                  { email }
              ]
          }
      });

  }

  public static async GetAllSuperAdmins(prisma:PrismaClient): Promise<SuperAdmin[]> {
    try {
      return await prisma.superAdmin.findMany({
        orderBy: { username: "asc" },
      });
    } catch (err: any) {
      console.error("Error Fetching SuperAdmins:", err);
      throw err;
    }
  }

  public static async ActivateSuperAdmin(email: string,prisma:PrismaClient): Promise<SuperAdmin> {
    try {
      const admin = await prisma.superAdmin.update({
        where: { email },
        data: { is_active: true },
      });
      return admin;
    } catch (err: any) {
      console.error("Error Activating SuperAdmin:", err);
      throw err;
    }
  }

  public static async DeleteSuperAdmin(username: string, prisma:PrismaClient): Promise<SuperAdmin> {
    try {
      const deletedAdmin = await prisma.superAdmin.delete({
        where: { username },
      });
      return deletedAdmin;
    } catch (err: any) {
      console.error("Error Deleting SuperAdmin:", err);
      throw err;
    }
  }

  public static async CountSuperAdmins(prisma:PrismaClient) : Promise<number> {
    return await prisma.superAdmin.count();
  }

  public static async AssignRootAccount(
    db_schema: string,
    user: Prisma.UserCreateInput
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

  public static async ActivateRootAccount(email: string, university_name: string, prisma:PrismaClient) {
    try {
      const university = await prisma.university.findUnique({
        where: { name: university_name }
      });

      if (!university) 
        throw new Error(`University '${university_name}' not found`);

      const db_schema = university.db_schema;


      const root_account = await prisma.user.update({
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
