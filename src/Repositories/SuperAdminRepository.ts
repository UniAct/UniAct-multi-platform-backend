import {Prisma, PrismaClient, SuperAdmin} from "@prisma/client"
import { TransactionService } from "../Services/Transaction";
import { MailService } from "../Services/MailService/MailService";
import { GetTenantClient } from "../Utils/prismaClient";


class SuperAdminRepository {
  public static async Create(
    username: string,
    email: string,
    password: string,
    prisma:PrismaClient
  ): Promise<SuperAdmin> {
    const newSuperAdmin : SuperAdmin = await prisma.superAdmin.create({
      data: {
        username,
        email,
        password,
      },
    });

    return newSuperAdmin;
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
  
    return await prisma.superAdmin.findMany({
      orderBy: { username: "asc" },
    });
  
  }

  public static async ActivateSuperAdmin(email: string,prisma:PrismaClient): Promise<SuperAdmin> {
  
    const admin = await prisma.superAdmin.update({
      where: { email },
      data: { is_active: true },
    });
    return admin;
  
  }

  public static async DeleteSuperAdmin(username: string, prisma:PrismaClient): Promise<SuperAdmin> {
    const deletedAdmin = await prisma.superAdmin.delete({
      where: { username },
    });
    return deletedAdmin;
  }

  public static async CountSuperAdmins(prisma:PrismaClient) : Promise<number> {
    return await prisma.superAdmin.count();
  }

  public static async AssignRootAccount(
    db_schema: string,
    user: Prisma.UserCreateInput
  ) {

    const root_account = await TransactionService.CreateRootAccount(
      user,
      db_schema
    );

    await MailService.SendVerificationRootAccountMail(user.email! , db_schema);

    return root_account;
  
  }

  public static async ActivateRootAccount(email: string , prisma:PrismaClient) {

    const root_account = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    return root_account;
  
  }

  public static async GetTenantRootAdmins(prisma: PrismaClient) {
    return prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              name: { in: ["Root", "Admin"] },
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ isBlocked: "asc" }, { username: "asc" }],
    });
  }

  public static async UpdateTenantRootAdminStatus(
    userId: number,
    data: { isVerified?: boolean; isBlocked?: boolean },
    prisma: PrismaClient
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  public static async UpdateTenantRootAdminPassword(
    userId: number,
    password: string,
    prisma: PrismaClient
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: { password },
      select: { id: true, username: true, email: true },
    });
  }

  public static async GetTenantRootAdminById(userId: number, prisma: PrismaClient) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        userRoles: {
          some: {
            role: {
              name: { in: ["Root", "Admin"] },
            },
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  }
}

export default SuperAdminRepository;
