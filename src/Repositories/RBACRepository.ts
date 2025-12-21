import { Prisma } from "@prisma/client";
import { Role , Permission , RolePermission} from "../generated/tenants/alexandria_national_university";
import { SchemaManager } from "../Utils/SchemaManager";

export class RBACRepository {
  //! put your permissions here

  public static Account = class {
    static Read    = { name: "account.read",    description: "Read user account information" };
    static Create  = { name: "account.create",  description: "Create user accounts" };
    static Update  = { name: "account.update",  description: "Update user account information" };
    static Delete  = { name: "account.delete",  description: "Delete user accounts" };
    static AssignRole  = { name: "account.assign_role",  description: "Assign roles to user accounts" };
  };

  public static RBAC = class {
    static Read    = { name: "rbac.read",    description: "Read all roles and permissions" };
    static Create  = { name: "rbac.create",  description: "Create roles and permissions" };
    static Update  = { name: "rbac.update",  description: "Update existing roles and permissions" };
    static Delete  = { name: "rbac.delete",  description: "Delete roles and permissions" };
  };

  public static Program = class {
    static Read   = { name: "program.read",   description: "Read program information" };
    static Create = { name: "program.create", description: "Create new programs" };
    static Update = { name: "program.update", description: "Update program information" };
    static Delete = { name: "program.delete", description: "Delete programs" };
  };

  public static Faculty = class {
    static Read   = { name: "faculty.read",   description: "Read faculty information" };
    static Create = { name: "faculty.create", description: "Create new faculties" };
    static Update = { name: "faculty.update", description: "Update faculty information" };
    static Delete = { name: "faculty.delete", description: "Delete faculties" };
  };

  public static async GetUserRoles(user_id : number , schema_name : string) : Promise<string[]>{
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const roles = await tenant_schema.role.findMany({
        where: {
          userRoles: {
            some: { userId: user_id },
          },
        },
        select: { name: true },
      });
    tenant_schema.$disconnect();
    // @ts-ignore
    return roles.map((r) => r.name);
  }

  public static async GetUserPermissions(user_id : number , schema_name : string) : Promise<string[]>{
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const permissions = await tenant_schema.permission.findMany({
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
    tenant_schema.$disconnect();
    // @ts-ignore
    return permissions.map((p) => p.name);
  }

  public static async CreateRole(name: string, description: string, schema_name: string): Promise<Role> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const role = await tenant_schema.role.create({
      data: { name, description },
    });
    tenant_schema.$disconnect();
    return role;
  }

  public static async GetRoleById(role_id: number, schema_name: string) {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);

    const role = await tenant_schema.role.findUnique({
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

    await tenant_schema.$disconnect();

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

  public static async GetRoleByName(role_name : string , schema_name: string){
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const role = await tenant_schema.role.findUnique({ where: { name: role_name } });
    tenant_schema.$disconnect();
    return role;
  }

  public static async UpdateRole(role_id: number, name: string, description: string, schema_name: string): Promise<Role> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const role = await tenant_schema.role.update({
      where: { id: role_id },
      data: { name, description },
    });
    tenant_schema.$disconnect();
    return role;
  }

  public static async DeleteRole(role_id: number, schema_name: string): Promise<Role> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const role = await tenant_schema.role.delete({ where: { id: role_id } });
    tenant_schema.$disconnect();
    return role;
  }

  public static async GetAllPermissions(schema_name: string): Promise<{ name: string; description: string | null }[]> {
  const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);

  const permissions = await tenant_schema.permission.findMany({
    select: { name: true, description: true },
  });

    tenant_schema.$disconnect();
    return permissions;
  }

  public static async GetPermissionById(id: number, schema_name: string): Promise<Permission | null> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);

    const permission = await tenant_schema.permission.findUnique({
      where: { id },
    });

    await tenant_schema.$disconnect();

    return permission;
  }

  public static async GetPermissionsByNames(
    permissions: string[],
    schema_name: string
  ): Promise<Permission[]> {
    const prisma = SchemaManager.GetTenantPrismaClient(schema_name);

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
      await prisma.$disconnect();
    }
  }

  public static async AssignPermissionsToRole(
    role_id: number,
    permissions: Permission[],
    schema_name: string
  ): Promise<RolePermission[]> {
    const prisma = SchemaManager.GetTenantPrismaClient(schema_name);

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
      await prisma.$disconnect();
    }
  }

  public static async GetAllRole(schema_name: string) {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);

    const roles = await tenant_schema.role.findMany({
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

    await tenant_schema.$disconnect();
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

  public static async GetRolesByNames(role_names: string[], schema_name: string) : Promise<Role[]> {
    const prisma = SchemaManager.GetTenantPrismaClient(schema_name);

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
      await prisma.$disconnect();
    }
  }

  public static async AssignRolesToUser(
    user_id: number,
    roles: Role[],
    schema_name: string
  ) {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);

    try {
      const result = await tenant_schema.$transaction(async (tx: Prisma.TransactionClient) => {
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
    } finally {
      await tenant_schema.$disconnect();
    }
  }
}