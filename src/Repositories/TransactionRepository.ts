import { User, Prisma, PrismaClient } from "@prisma/client";
import SystemRoles from "../Enums/SystemRoles";
import Permissions from "../Utils/PermissionsParser";

const DEFAULT_PERMISSIONS = Permissions;

export class TransactionRepository {
  public static async CreateRootAccount(
    user: Prisma.UserCreateInput,
    prisma: PrismaClient
  ): Promise<User> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing_user = await tx.user.findFirst({
        where: {
          OR: [
            { email: user.email },
            { username: user.username },
            { nationalId: user.nationalId },
          ],
        },
        select: { id: true }, 
      });

      if (existing_user) {
        throw new Error("Username or Email or NationalId already exists in this university");
      }

      const [root_account, role] = await Promise.all([
        tx.user.create({
          data: {
            username: user.username!,
            firstName: user.firstName!,
            lastName: user.lastName!,
            email: user.email!,
            password: user.password!,
            phone: user.phone!,
            dateOfBirth: user.dateOfBirth!,
            address: user.address!,
            city: user.city!,
            country: user.country!,
            nationalId: user.nationalId!,
          },
        }),
        tx.role.upsert({
          where: { name: SystemRoles.RootAccount },
          update: {},
          create: {
            name: SystemRoles.RootAccount,
            description: "Root account with full permissions",
          },
          include: { permissions: { select: { permission: true } } },
        }),
      ]);

      await tx.permission.createMany({
        data: DEFAULT_PERMISSIONS.map((p) => ({
          name: p.name,
          description: p.description,
        })),
        skipDuplicates: true,
      });

      const permissions = await tx.permission.findMany({
        where: { name: { in: DEFAULT_PERMISSIONS.map((p) => p.name) } },
        select: { id: true },
      });

      await tx.rolePermission.createMany({
        data: permissions.map((p) => ({
          roleId: role.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });

      await tx.userRole.upsert({
        where: {
          userId_roleId: { userId: root_account.id, roleId: role.id },
        },
        update: {},
        create: { userId: root_account.id, roleId: role.id },
      });

      return root_account;
    });
  }
}
