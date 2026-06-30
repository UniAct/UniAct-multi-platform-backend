import bcrypt from "bcrypt";
import SuperAdminRepository from "../Repositories/SuperAdminRepository";
import {Prisma } from "@prisma/client"
import { SuperAdmin } from "@prisma/client"
import { TransactionService } from "./Transaction";
import { MailService } from "./MailService/MailService";
import { GetTenantClient } from "../Utils/prismaClient";
import { NotFoundError } from "../Types/Errors";

class SuperAdminService {
  public static async CreateSuperAdmin(
    username: string,
    email: string,
    password: string,
    schema_name:string
  ): Promise<SuperAdmin> {

    const prisma = GetTenantClient(schema_name);

    const hashedPassword = await bcrypt.hash(password, 10);

    return await SuperAdminRepository.Create(
      username,
      email,
      hashedPassword,
      prisma
    );
  }

  public static async GetSuperAdminByEmail(email : string,schema_name:string) : Promise<SuperAdmin | null> {

    const prisma = GetTenantClient(schema_name);
    return await SuperAdminRepository.FindByEmail(email,prisma);
  }

  public static async GetAllSuperAdmins(schema_name:string): Promise<SuperAdmin[]> {

    const prisma = GetTenantClient(schema_name);
    return await SuperAdminRepository.GetAllSuperAdmins(prisma);
  }

  public static async ActivateSuperAdmin(email: string, schema_name:string): Promise<SuperAdmin> {

    const prisma = GetTenantClient(schema_name);
    const admin = await SuperAdminRepository.ActivateSuperAdmin(email,prisma);
    if (!admin) throw new Error("SuperAdmin Not Found");
    return admin;
  }

  public static async DeleteSuperAdmin(username: string,schema_name:string): Promise<SuperAdmin> {

    const prisma = GetTenantClient(schema_name);
    const admin = await SuperAdminRepository.DeleteSuperAdmin(username,prisma);
    if (!admin) throw new Error("SuperAdmin Not Found");
    return admin;
  }

  public static async ActivateRootAccount(email : string , schema_name:string){

    const prisma = GetTenantClient(schema_name);
    const root_account = await SuperAdminRepository.ActivateRootAccount(email , prisma);
    if (!root_account) throw new Error("Root Account Not Found");
    return root_account;
  }

  public static async AssignRootAccount(university_name: string , schema_name : string ,user: Prisma.UserCreateInput){
    try {

      const root_account = await TransactionService.CreateRootAccount(
        user,
        schema_name
      );


      await MailService.SendVerificationRootAccountMail(user.email! , university_name!);

      return root_account;
    } catch (err: any) {
      console.error("Error Assigning Root Account:", err);
      throw err;
    }
    
  }

  public static async GetTenantRootAdmins(schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    const admins = await SuperAdminRepository.GetTenantRootAdmins(prisma);

    return admins.map((admin) => ({
      id: admin.id,
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      isVerified: admin.isVerified,
      isBlocked: admin.isBlocked,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      roles: admin.userRoles.map((entry) => entry.role.name),
    }));
  }

  public static async SetTenantRootAdminStatus(
    schema_name: string,
    userId: number,
    data: { isVerified?: boolean; isBlocked?: boolean }
  ) {
    const prisma = GetTenantClient(schema_name);
    const admin = await SuperAdminRepository.GetTenantRootAdminById(userId, prisma);
    if (!admin) throw new NotFoundError("Root admin not found in this tenant");

    const updated = await SuperAdminRepository.UpdateTenantRootAdminStatus(
      userId,
      data,
      prisma
    );

    return {
      id: updated.id,
      username: updated.username,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      isVerified: updated.isVerified,
      isBlocked: updated.isBlocked,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      roles: updated.userRoles.map((entry) => entry.role.name),
    };
  }

  public static async ResetTenantRootAdminPassword(
    schema_name: string,
    userId: number,
    password: string
  ) {
    const prisma = GetTenantClient(schema_name);
    const admin = await SuperAdminRepository.GetTenantRootAdminById(userId, prisma);
    if (!admin) throw new NotFoundError("Root admin not found in this tenant");

    const hashedPassword = await bcrypt.hash(password, 10);
    return SuperAdminRepository.UpdateTenantRootAdminPassword(userId, hashedPassword, prisma);
  }

  public static async ResendTenantRootAdminVerification(
    schema_name: string,
    university_name: string,
    userId: number
  ) {
    const prisma = GetTenantClient(schema_name);
    const admin = await SuperAdminRepository.GetTenantRootAdminById(userId, prisma);
    if (!admin) throw new NotFoundError("Root admin not found in this tenant");

    await MailService.SendVerificationRootAccountMail(admin.email, university_name);
    return admin;
  }
}

export default SuperAdminService;
