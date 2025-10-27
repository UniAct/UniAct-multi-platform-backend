import { RBACRepository } from "../Repositories/RBACRepository";
import { UserRepository } from "../Repositories/UserRepository";
import { SchemaManager } from "../Utils/SchemaManager";
import { Permission, Role } from "../generated/tenants/alexandria_national_university";

export class RBACService {
  public static async CreateRole(name: string, description: string, schema_name: string): Promise<Role> {
    const existingRole = await RBACRepository.GetRoleByName(name, schema_name);
    if (existingRole) {
      throw new Error(`Role '${name}' already exists`);
    }

    return await RBACRepository.CreateRole(name, description, schema_name);
  }

  public static async GetRole(role_id: number, schema_name: string): Promise<Role | null> {
    return await RBACRepository.GetRoleById(role_id, schema_name);
  }

  public static async UpdateRole(role_id: number, name: string, description: string, schema_name: string): Promise<Role> {
    const existingRole = await RBACRepository.GetRoleById(role_id, schema_name);
    if (!existingRole) 
      throw new Error("Role not exists");
    

    const duplicateRole = await RBACRepository.GetRoleByName(name, schema_name);
    if (duplicateRole) {
      throw new Error("That role name already exists");
    }

    const updatedRole = await RBACRepository.UpdateRole(role_id, name, description, schema_name);
    return updatedRole;
  }


  public static async DeleteRole(role_id: number, schema_name: string): Promise<Role> {
    const existingRole = await RBACRepository.GetRoleById(role_id, schema_name);

    if (!existingRole) 
      throw new Error("Role not exists");
    

    const deletedRole = await RBACRepository.DeleteRole(role_id, schema_name);

    return deletedRole;
  }


  public static async GetUserRoles(user_id: number, schema_name: string): Promise<string[]> {
    return await RBACRepository.GetUserRoles(user_id, schema_name);
  }

  public static async GetAllPermissions(schema_name: string): Promise<{ name: string; description: string | null }[]> {
    const permissions = await RBACRepository.GetAllPermissions(schema_name);

    if (!permissions || permissions.length === 0) 
      throw new Error("No permissions found");
    

    return permissions;
  }

  public static async GetPermissionById(id: number, schema_name: string): Promise<Permission> {
    const permission : Permission | null = await RBACRepository.GetPermissionById(id, schema_name);

    if (!permission) 
      throw new Error("Permission not found");

    return permission;
  }

  public static async AssignPermissionsToRole(
    role_id: number,
    permissions: string[],
    schema_name: string
  ) {
    const role = await RBACRepository.GetRoleById(role_id, schema_name);
    if (!role) 
      throw new Error("Role not exists");
    

    const found_permissions = await RBACRepository.GetPermissionsByNames(permissions, schema_name);

    if (!found_permissions || found_permissions.length === 0) 
      throw new Error("No valid permissions found");
    

    const found_names = found_permissions.map((p) => p.name);
    const missing = permissions.filter((p) => !found_names.includes(p));

    if (missing.length > 0) 
      throw new Error(`Some permissions do not exist: ${missing.join(", ")}`);
    

    const updatedRole = await RBACRepository.AssignPermissionsToRole(
      role_id,
      found_permissions,
      schema_name
    );

    if (!updatedRole) 
      throw new Error("Failed to assign permissions to role");
    

    return updatedRole;
  }

  public static async GetAllRole(schema_name: string): Promise<Role[]> {
    const roles = await RBACRepository.GetAllRole(schema_name);

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
    const user = await UserRepository.GetUserById(user_id, schema_name);
    if (!user) throw new Error("User not found");

    const found_roles : Role[] = await RBACRepository.GetRolesByNames(role_names, schema_name);

    if (found_roles.length !== role_names.length) {
      const foundNames = found_roles.map(r => r.name);
      const missing = role_names.filter(name => !foundNames.includes(name));
      throw new Error(`Some roles not found: ${missing.join(", ")}`);
    }

    const updatedUser = await RBACRepository.AssignRolesToUser(user_id, found_roles, schema_name);

    return updatedUser;
  }

}
