import bcrypt from "bcrypt";
import SuperAdminRepository from "../Repositories/SuperAdminRepository";
import {Prisma } from "@prisma/client"
import { SuperAdmin } from "@prisma/client"
import { TransactionService } from "./Transaction";
import { MailService } from "./MailService/MailService";
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { getTenantClient } from "../Utils/prismaClient";

class SuperAdminService {
  public static async CreateSuperAdmin(
    username: string,
    email: string,
    password: string,
    schema_name:string
  ): Promise<SuperAdmin> {

    const prisma = getTenantClient(schema_name);

    const hashedPassword = await bcrypt.hash(password, 10);

    return await SuperAdminRepository.Create(
      username,
      email,
      hashedPassword,
      prisma
    );
  }

  public static async GetSuperAdminByEmail(email : string,schema_name:string) : Promise<SuperAdmin | null> {

    const prisma = getTenantClient(schema_name);
    return await SuperAdminRepository.FindByEmail(email,prisma);
  }

  public static async GetAllSuperAdmins(schema_name:string): Promise<SuperAdmin[]> {

    const prisma = getTenantClient(schema_name);
    return await SuperAdminRepository.GetAllSuperAdmins(prisma);
  }

  public static async ActivateSuperAdmin(email: string, schema_name:string): Promise<SuperAdmin> {

    const prisma = getTenantClient(schema_name);
    const admin = await SuperAdminRepository.ActivateSuperAdmin(email,prisma);
    if (!admin) throw new Error("SuperAdmin Not Found");
    return admin;
  }

  public static async DeleteSuperAdmin(username: string,schema_name:string): Promise<SuperAdmin> {

    const prisma = getTenantClient(schema_name);
    const admin = await SuperAdminRepository.DeleteSuperAdmin(username,prisma);
    if (!admin) throw new Error("SuperAdmin Not Found");
    return admin;
  }

  public static async ActivateRootAccount(email : string , schema_name:string){

    const prisma = getTenantClient(schema_name);
    const root_account = await SuperAdminRepository.ActivateRootAccount(email , prisma);
    if (!root_account) throw new Error("Root Account Not Found");
    return root_account;
  }

  public static async AssignRootAccount(schema_name: string,user: Prisma.UserCreateInput){
    try {
      const root_account = await TransactionService.CreateRootAccount(
        user,
        schema_name
      );


      const prisma = getTenantClient("public");
      const university_name = await UniversityRepository.GetUniversityNameBySchema(schema_name,prisma)

      await MailService.SendVerificationRootAccountMail(user.email! , schema_name!);

      return root_account;
    } catch (err: any) {
      console.error("Error Assigning Root Account:", err);
      throw err;
    }
    
  }
}

export default SuperAdminService;
