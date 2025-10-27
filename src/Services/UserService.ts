import { Prisma , User , Permission , Role} from "../generated/tenants/alexandria_national_university";
import { RBACRepository } from "../Repositories/RBACRepository";
import { UserRepository } from "../Repositories/UserRepository";
import { SchemaManager } from "../Utils/SchemaManager";
import {IStaffAccount} from "../Interfaces/StaffAccount"
import bcrypt from "bcrypt";
export class UserService {

  public static async GetAllUsers(schema_name: string): Promise<User[]> {
    try {
      const users = await UserRepository.GetAllUsers(schema_name);
      return users;
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      throw new Error(err.message || "Failed to fetch users.");
    }
  }

  public static async GetUserById(id: number, schema_name: string): Promise<User> {
    try {
      const user = await UserRepository.GetUserById(id, schema_name);
      if (!user) {
        throw new Error(`User with ID ${id} not found.`);
      }
      return user;
    } catch (err: any) {
      console.error("Error fetching user:", err.message);
      throw new Error(err.message || "Failed to fetch user.");
    }
  }

  public static async GetUserByEmailOrUsernameOrNationalId(
    user: Pick<User, "email" | "username" | "nationalId">,
    schema_name: string
  ): Promise<User | null> {
    try {
      const existingUser = await UserRepository.GetUserByFields(user, schema_name);

      if (!existingUser) {
        console.warn(
          `[WARN] No user found with email '${user.email}', username '${user.username}', or nationalId '${user.nationalId}' in schema '${schema_name}'`
        );
        return null;
      }

      return existingUser;
    } catch (err: any) {
      console.error(
        `[ERROR] Error checking user by email/username/nationalId:`,
        err
      );
      throw new Error("Database error while checking user existence.");
    }
  }

  public static async GetUserByEmail(email: string, schema_name: string): Promise<User | null> {
    try {
      const user: User | null = await UserRepository.GetUserByEmail(email, schema_name);
      if (!user) {
        console.warn(`[WARN] No user found with email '${email}' in schema '${schema_name}'`);
        return null;
      }

      return user;
    } catch (err: any) {
      console.error(`[ERROR] Error fetching user (${email}):`, err);
      throw new Error("Database error while fetching user.");
    }
  }


  public static async UpdateUser(id: number, updateData: Partial<User>, schema_name: string): Promise<User> {
    try {
      const updatedUser = await UserRepository.UpdateUser(id, updateData, schema_name);
      return updatedUser;
    } catch (err: any) {
      console.error("Error updating user:", err.message);
      throw new Error(err.message || "Failed to update user.");
    }
  }

  public static async DeleteUser(id: number, schema_name: string): Promise<User> {
    try {
      const deletedUser = await UserRepository.DeleteUser(id, schema_name);
      return deletedUser;
    } catch (err: any) {
      console.error("Error deleting user:", err.message);
      throw new Error(err.message || "Failed to delete user.");
    }
  }

  public static async GetUserRoles(
    user_id: number,
    schema_name: string
  ): Promise<string[]> {
    const roles = await RBACRepository.GetUserRoles(user_id , schema_name);
    return roles;
  }

  public static async GetUserPermissions(
    user_id: number,
    schema_name: string
  ): Promise<string[]> {
    const permissions = await RBACRepository.GetUserPermissions(user_id , schema_name);
    return permissions;
  }

  public static async CreateStaffAccount(staff: IStaffAccount, schema_name: string) {
    const username = staff.username;
    const email = staff.email;
    const nationalId = staff.national_id;

    const existing = await UserRepository.GetStaffByFields(
      { username, email, nationalId },
      schema_name
    );

    if (existing)
      throw new Error("User with the same email, username, or national ID already exists");

    const hashed_password = await bcrypt.hash(staff.password!, 10);

    const createdStaff = await UserRepository.CreateStaffAccount(
      { ...staff, password: hashed_password }, 
      schema_name
    );

    return createdStaff;
  }
}
