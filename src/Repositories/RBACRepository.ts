import { Role, Permission, RolePermission, PrismaClient } from "@prisma/client"


//under test function to generate the (resource.permission) automatically instead of repeated code

function CRUD(resource: string) {
  return {
    Create: { Name: `${resource}.create`, Description: `Create ${resource}` },
    Read: { Name: `${resource}.read`, Description: `Read ${resource}` },
    Update: { Name: `${resource}.update`, Description: `Update ${resource}` },
    Delete: { Name: `${resource}.delete`, Description: `Delete ${resource}` },
  };
}


export class RBACRepository {

  //! put your permissions here

  public static Program = CRUD("program")

  public static Faculty = CRUD("faculty")



  public static Account = class {
    static Read = { Name: "account.read", Description: "Read user account information" };
    static Create = { Name: "account.create", Description: "Create user accounts" };
    static Update = { Name: "account.update", Description: "Update user account information" };
    static Delete = { Name: "account.delete", Description: "Delete user accounts" };
    static AssignRole = { Name: "account.assign_role", Description: "Assign roles to user accounts" };
  };

  public static Role = class {
    static Read = { Name: "role.read", Description: "Read all roles and permissions" };
    static Create = { Name: "role.create", Description: "Create roles and permissions" };
    static Update = { Name: "role.update", Description: "Update existing roles and permissions" };
    static Delete = { Name: "role.delete", Description: "Delete roles and permissions" };
  };



  public static async GetUserRoles(user_id: number, prisma: PrismaClient): Promise<string[]> {

    const roles = await prisma.role.findMany({
      where: {
        userRoles: {
          some: { userId: user_id },
        },
      },
      select: { name: true },
    });
    // @ts-ignore
    return roles.map((r) => r.name);
  }

  public static async GetUserPermissions(user_id: number, prisma: PrismaClient): Promise<string[]> {

    const permissions = await prisma.permission.findMany({
      where: {
        rolePermissions: {
          some: {
            role: {
              userRoles: {
                some: { userId: user_id },
              },
            },
          },
        },
      },
      select: { name: true },
      distinct: ["id"],
    });
    // @ts-ignore
    return permissions.map((p) => p.name);
  }

  public static async CreateRole(name: string, description: string, prisma: PrismaClient): Promise<Role> {

    const role = await prisma.role.create({
      data: { name, description },
    });
    return role;
  }

  public static async GetRoleById(role_id: number, prisma: PrismaClient) {


    const role = await prisma.role.findUnique({
      where: { id: role_id },
      include: {
        permissions: {
          include: {
            permission: {
              select: { name: true },
            },
          },
        },
      },
    });



    if (!role) return null;

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      // @ts-ignore
      permissions: role.permissions.map((rp) => rp.permission.name),
    };
  }

  public static async GetRoleByName(role_name: string, prisma: PrismaClient) {

    const role = await prisma.role.findUnique({ where: { name: role_name } });
    return role;
  }

  public static async UpdateRole(role_id: number, name: string, description: string, prisma: PrismaClient): Promise<Role> {

    const role = await prisma.role.update({
      where: { id: role_id },
      data: { name, description },
    });
    return role;
  }

  public static async DeleteRole(role_id: number, prisma: PrismaClient): Promise<Role> {

    const role = await prisma.role.delete({ where: { id: role_id } });
    return role;
  }

  public static async GetAllPermissions(prisma: PrismaClient): Promise<{ name: string; description: string | null }[]> {


    const permissions = await prisma.permission.findMany({
      select: { name: true, description: true },
    });
    return permissions;
  }

  public static async GetPermissionById(id: number, prisma: PrismaClient): Promise<Permission | null> {


    const permission = await prisma.permission.findUnique({
      where: { id },
    });



    return permission;
  }

  public static async GetPermissionsByNames(
    permissions: string[],
    prisma: PrismaClient
  ): Promise<Permission[]> {
    try {
      const result = await prisma.permission.findMany({
        where: {
          name: {
            in: permissions,
          },
        },
      });

      return result;
    } catch (err) {
      console.error("Error fetching permissions by names:", err);
      throw err;
    } finally {

    }
  }

  public static async AssignPermissionsToRole(
    role_id: number,
    permissions: Permission[],
    prisma: PrismaClient
  ): Promise<RolePermission[]> {

    try {
      // @ts-ignore
      return await prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({
          where: { roleId: role_id },
        });

        const createdLinks = await Promise.all(
          permissions.map((perm) =>
            tx.rolePermission.create({
              data: {
                roleId: role_id,
                permissionId: perm.id,
              },
            })
          )
        );

        return createdLinks;
      });
    } catch (err) {
      console.error("Error assigning permissions to role:", err);
      throw err;
    } finally {

    }
  }

  public static async GetAllRole(prisma: PrismaClient) {


    const roles = await prisma.role.findMany({
      orderBy: { id: "asc" },
      include: {
        permissions: {
          include: {
            permission: {
              select: { name: true },
            },
          },
        },
      },
    });


    // @ts-ignore
    const formatted = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      // @ts-ignore
      permissions: role.permissions.map((rp) => rp.permission.name),
    }));

    return formatted;
  }

  public static async GetRolesByNames(role_names: string[], prisma: PrismaClient): Promise<Role[]> {

    try {
      const roles = await prisma.role.findMany({
        where: {
          name: {
            in: role_names,
          },
        },
      });

      return roles;
    } catch (error) {
      console.error("Error fetching roles by names:", error);
      throw error;
    } finally {

    }
  }

  public static async AssignRolesToUser(
    user_id: number,
    roles: Role[],
    prisma: PrismaClient
  ) {


    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.userRole.deleteMany({
          where: { userId: user_id },
        });

        const assignments = roles.map((role) => ({
          userId: user_id,
          roleId: role.id,
        }));

        await tx.userRole.createMany({ data: assignments });

        const updatedUser = await tx.user.findUnique({
          where: { id: user_id },
          include: {
            userRoles: {
              include: { role: true },
            },
          },
        });

        return updatedUser;
      });

      return result;
    } catch (error) {
      console.error("Error assigning roles to user:", error);
      throw error;
    }
  }
}
