import { User, Prisma, PrismaClient } from "@prisma/client";
import SystemRoles from "../Enums/SystemRoles";
import { RBACRepository } from "./RBACRepository";

const DEFAULT_PERMISSIONS = RBACRepository.GetDefaultPermissionDefinitions();

export class TransactionRepository {
  public static async CreateRootAccount(
    user: Prisma.UserCreateInput,
    prisma: PrismaClient
  ): Promise<User> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Check for existing user
      const existing_user = await tx.user.findFirst({
        where: {
          OR: [
            { email: user.email },
            { username: user.username },
            { nationalId: user.nationalId },
          ],
        },
        select: { id: true }, // only fetch what's needed
      });

      if (existing_user) {
        throw new Error("Username or Email or NationalId already exists in this university");
      }

      // 2. Create user + upsert role in parallel
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

      // 3. Batch-upsert all permissions in one query
      await tx.permission.createMany({
        data: DEFAULT_PERMISSIONS.map((p) => ({
          name: p.Name,
          description: p.Description,
        })),
        skipDuplicates: true,
      });

      // 4. Fetch all permission IDs in one query
      const permissions = await tx.permission.findMany({
        where: { name: { in: DEFAULT_PERMISSIONS.map((p) => p.Name) } },
        select: { id: true },
      });

      // 5. Batch-upsert all role-permission links
      await tx.rolePermission.createMany({
        data: permissions.map((p) => ({
          roleId: role.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });

      // 6. Upsert user-role link
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
