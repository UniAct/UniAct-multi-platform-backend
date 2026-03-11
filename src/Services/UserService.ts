import { User } from "@prisma/client";
import { RBACRepository } from "../Repositories/RBACRepository";
import { UserRepository } from "../Repositories/UserRepository";
import {IStaffAccount} from "../Interfaces/StaffAccount"
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import JwtService from "../Utils/JwtService";
import { getTenantClient } from "../Utils/prismaClient";

export class UserService {

  public static async GetAllUsers(schema_name: string): Promise<User[]> {
    try {
      const prisma = getTenantClient(schema_name);
      const users = await UserRepository.GetAllUsers(prisma);
      return users;
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      throw new Error(err.message || "Failed to fetch users.");
    }
  }

  public static async GetUserById(id: number, schema_name: string): Promise<User> {
    try {
      const prisma = getTenantClient(schema_name);
      const user = await UserRepository.GetUserById(id, prisma);
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
      const prisma = getTenantClient(schema_name);
      const existingUser = await UserRepository.GetUserByUniqueFields(user, prisma);

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
      const prisma = getTenantClient(schema_name);
      const user: User | null = await UserRepository.GetUserByEmail(email, prisma);
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
      const prisma = getTenantClient(schema_name);
      const updatedUser = await UserRepository.UpdateUser(id, updateData, prisma);
      return updatedUser;
    } catch (err: any) {
      console.error("Error updating user:", err.message);
      throw new Error(err.message || "Failed to update user.");
    }
  }

  public static async DeleteUser(id: number, schema_name: string): Promise<User> {
    try {
      const prisma = getTenantClient(schema_name);
      const deletedUser = await UserRepository.DeleteUser(id, prisma);
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

    const prisma = getTenantClient(schema_name);
    const roles = await RBACRepository.GetUserRoles(user_id , prisma);
    return roles;
  }

  public static async GetUserPermissions(
    user_id: number,
    schema_name: string
  ): Promise<string[]> {
    const prisma = getTenantClient(schema_name);
    const permissions = await RBACRepository.GetUserPermissions(user_id , prisma);
    return permissions;
  }

  public static async CreateStaffAccount(staff: IStaffAccount , schema_name: string) {
    const prisma = getTenantClient(schema_name);
    const username = staff.username;
    const email = staff.email;
    const nationalId = staff.national_id;

    const existing = await UserRepository.GetUserByUniqueFields(
      { username, email, nationalId },
      prisma
    );

    if (existing)
      throw new Error("User with the same email, username, or national ID already exists");

    const hashed_password = await bcrypt.hash(staff.password!, 10);

    const createdStaff = await UserRepository.CreateStaffAccount(
      { ...staff, password: hashed_password }, 
      prisma
    );

    return createdStaff;
  }

  public static async Login(
    email: string,
    password: string,
    db_schema: string,
    tenant_name: string
  ) {
    const user = await this.GetUserByEmail(email, db_schema);
    if (!user) {
      return {
        status: StatusCodes.UNAUTHORIZED,
        body: {
          status: JSendStatus.FAIL,
          message: "Invalid email or password.",
        },
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        status: StatusCodes.UNAUTHORIZED,
        body: {
          status: JSendStatus.FAIL,
          message: "Invalid email or password.",
        },
      };
    }

    if (!user.isVerified) {
      return {
        status: StatusCodes.FORBIDDEN,
        body: {
          status: JSendStatus.FAIL,
          data: {
            message: "Your email has not been verified yet. Please check your inbox.",
          },
        },
      };
    }

    const roles = await this.GetUserRoles(user.id, db_schema);
    const permissions = await this.GetUserPermissions(user.id, db_schema);

    if (!roles || roles.length === 0) {
      console.warn(`[Security] Login attempt for user ${user.id} with no roles`);
      return {
        status: StatusCodes.FORBIDDEN,
        body: {
          status: JSendStatus.FAIL,
          message: "User account has no roles assigned. Please contact administrator.",
        },
      };
    }

    const token = JwtService.Sign({
      id: user.id,
      email: user.email,
      tenant_name: tenant_name,
      roles,
      permissions,
    });

    return {
      status: StatusCodes.OK,
      body: {
        status: JSendStatus.SUCCESS,
        message: "Login successful.",
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles,
          },
        },
      },
    };
  }
}
