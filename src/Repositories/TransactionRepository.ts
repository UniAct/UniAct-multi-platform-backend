import { User,Prisma, PrismaClient } from "@prisma/client";
import SystemRoles from "../Enums/SystemRoles";
import { RBACRepository } from "./RBACRepository";

export class TransactionRepository {
  public static async CreateRootAccount(user: Prisma.UserCreateInput, prisma: PrismaClient): Promise<User> {
    
    return await prisma.$transaction(async (tx : Prisma.TransactionClient) => {

      const existing_user = await tx.user.findFirst({
        where: {
          OR: [
            { email: user.email },
            { username: user.username },
            { nationalId: user.nationalId },
          ],
        },
      });

      if (existing_user) {
        throw new Error(
          `Username or Email or NationalId already exists in this university`
        );
      }
      console.log(user);
      const root_account = await tx.user.create({
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
      });

      let role_existing: any = await tx.role.findUnique({
        where: { name: SystemRoles.RootAccount },
        include: { permissions: true, userRoles: true },
      });

      if (!role_existing) {
        role_existing = await tx.role.create({
          data: {
            name: SystemRoles.RootAccount,
            description: "Root account with full permissions",
          },
        });
      }

      const default_permissions = [
        RBACRepository.Role.Create,
        RBACRepository.Role.Read,
        RBACRepository.Role.Update,
        RBACRepository.Role.Delete,
        RBACRepository.Account.Create,
        RBACRepository.Account.Read,
        RBACRepository.Account.Update,
        RBACRepository.Account.Delete,
        RBACRepository.Account.AssignRole,
        //faculty permissions
        RBACRepository.Faculty.Create,
        RBACRepository.Faculty.Read,
        RBACRepository.Faculty.Update,
        RBACRepository.Faculty.Delete,
        //program permissions
        RBACRepository.Program.Create,
        RBACRepository.Program.Read,
        RBACRepository.Program.Update,
        RBACRepository.Program.Delete,

      ];

      for (const perm of default_permissions) {
        let permission = await tx.permission.findUnique({ where: { name: perm.Name } });

        if (!permission) {
          permission = await tx.permission.create({
            data: {
              name: perm.Name,
              description: perm.Description,
            },
          });
        }

        const role_perm_exists = await tx.rolePermission.findFirst({
          where: { roleId: role_existing.id, permissionId: permission.id },
        });

        if (!role_perm_exists) {
          await tx.rolePermission.create({
            data: { roleId: role_existing.id, permissionId: permission.id },
          });
        }
      }

      const existing_link = await tx.userRole.findFirst({
        where: { userId: root_account.id, roleId: role_existing.id },
      });

      if (!existing_link) {
        await tx.userRole.create({
          data: { userId: root_account.id, roleId: role_existing.id },
        });
      }

      return root_account;
    });
  }
}
