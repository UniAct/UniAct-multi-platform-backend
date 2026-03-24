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
      // 1. Check if user exists
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
        throw new Error(
          "Username or Email or NationalId already exists in this university"
        );
      }

      // 2. Create user and upsert role in parallel
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
        }),
      ]);

      // 3. Create permissions (skip duplicates) and role-permission mapping in parallel
      const permissionNames = DEFAULT_PERMISSIONS.map((p) => p.name);

      const [permissions] = await Promise.all([
        tx.permission.findMany({
          where: { name: { in: permissionNames } },
          select: { id: true, name: true },
        }).then(async (existing) => {
          // Insert only missing permissions
          const existingNames = new Set(existing.map((p) => p.name));
          const toCreate = DEFAULT_PERMISSIONS.filter(
            (p) => !existingNames.has(p.name)
          ).map((p) => ({ name: p.name, description: p.description }));

          if (toCreate.length > 0) {
            await tx.permission.createMany({ data: toCreate });
            // Re-fetch all IDs
            return tx.permission.findMany({
              where: { name: { in: permissionNames } },
              select: { id: true },
            });
          }

          return existing;
        }),
        tx.userRole.upsert({
          where: { userId_roleId: { userId: root_account.id, roleId: role.id } },
          update: {},
          create: { userId: root_account.id, roleId: role.id },
        }),
      ]);

      // 4. Map role-permissions (bulk insert skip duplicates)
      await tx.rolePermission.createMany({
        data: permissions.map((p) => ({
          roleId: role.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });

      return root_account;
    });
  }
}