import { RBACRepository } from "../Repositories/RBACRepository";
import { UserRepository } from "../Repositories/UserRepository";
import { Permission, Role} from "@prisma/client"
import { getTenantClient } from "../Utils/prismaClient";

export class RBACService {
  public static async CreateRole(name: string, description: string, schema_name: string): Promise<Role> {
    const prisma = getTenantClient(schema_name)
    const existingRole = await RBACRepository.GetRoleByName(name, prisma);
    if (existingRole) {
      throw new Error(`Role '${name}' already exists`);
    }

    return await RBACRepository.CreateRole(name, description, prisma);
  }

  public static async GetRole(role_id: number, schema_name: string): Promise<Role | null> {
    const prisma = getTenantClient(schema_name)
    return await RBACRepository.GetRoleById(role_id, prisma);
  }

  public static async UpdateRole(role_id: number, name: string, description: string, schema_name: string): Promise<Role> {
    const prisma = getTenantClient(schema_name)
    const existingRole = await RBACRepository.GetRoleById(role_id, prisma);
    if (!existingRole) 
      throw new Error("Role not exists");
    

    const duplicateRole = await RBACRepository.GetRoleByName(name, prisma);
    if (duplicateRole) {
      throw new Error("That role name already exists");
    }

    const updatedRole = await RBACRepository.UpdateRole(role_id, name, description, prisma);
    return updatedRole;
  }


  public static async DeleteRole(role_id: number, schema_name: string): Promise<Role> {
    const prisma = getTenantClient(schema_name)
    const existingRole = await RBACRepository.GetRoleById(role_id, prisma);

    if (!existingRole) 
      throw new Error("Role not exists");
    

    const deletedRole = await RBACRepository.DeleteRole(role_id, prisma);

    return deletedRole;
  }


  public static async GetUserRoles(user_id: number, schema_name: string): Promise<string[]> {
    const prisma = getTenantClient(schema_name)
    return await RBACRepository.GetUserRoles(user_id, prisma);
  }

  public static async GetAllPermissions(schema_name: string): Promise<{ name: string; description: string | null }[]> {
    const prisma = getTenantClient(schema_name)
    const permissions = await RBACRepository.GetAllPermissions(prisma);

    if (!permissions || permissions.length === 0) 
      throw new Error("No permissions found");
    

    return permissions;
  }

  public static async GetPermissionById(id: number, schema_name: string): Promise<Permission> {
    const prisma = getTenantClient(schema_name)
    const permission : Permission | null = await RBACRepository.GetPermissionById(id, prisma);

    if (!permission) 
      throw new Error("Permission not found");

    return permission;
  }

  public static async AssignPermissionsToRole(
    role_id: number,
    permissions: string[],
    schema_name: string
  ) {
    const prisma = getTenantClient(schema_name);
    const role = await RBACRepository.GetRoleById(role_id, prisma);
    if (!role) 
      throw new Error("Role not exists");
    

    const found_permissions = await RBACRepository.GetPermissionsByNames(permissions, prisma);

    if (!found_permissions || found_permissions.length === 0) 
      throw new Error("No valid permissions found");
    

    const found_names = found_permissions.map((p) => p.name);
    const missing = permissions.filter((p) => !found_names.includes(p));

    if (missing.length > 0) 
      throw new Error(`Some permissions do not exist: ${missing.join(", ")}`);
    

    const updatedRole = await RBACRepository.AssignPermissionsToRole(
      role_id,
      found_permissions,
      prisma
    );

    if (!updatedRole) 
      throw new Error("Failed to assign permissions to role");
    

    return updatedRole;
  }

  public static async GetAllRole(schema_name: string): Promise<Role[]> {
    const prisma = getTenantClient(schema_name);
    const roles = await RBACRepository.GetAllRole( prisma);

    if (!roles || roles.length === 0) {
      throw new Error("No roles found");
    }

    return roles;
  }

  public static async AssignRoleToUser(
    user_id: number,
    role_names: string[],
    schema_name: string
  ) {
    const prisma = getTenantClient(schema_name);
    const user = await UserRepository.GetUserById(user_id, prisma);
    if (!user) throw new Error("User not found");

    const found_roles : Role[] = await RBACRepository.GetRolesByNames(role_names, prisma);

    if (found_roles.length !== role_names.length) {
      const foundNames = found_roles.map(r => r.name);
      const missing = role_names.filter(name => !foundNames.includes(name));
      throw new Error(`Some roles not found: ${missing.join(", ")}`);
    }

    const updatedUser = await RBACRepository.AssignRolesToUser(user_id, found_roles, prisma);

    return updatedUser;
  }

}
