import { PrismaClient, Staff, Student, User } from "@prisma/client";
import { RBACRepository } from "../Repositories/RBACRepository";
import { UserRepository } from "../Repositories/UserRepository";
import { IStaffAccount } from "../Interfaces/StaffAccount"
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import JwtService from "../Utils/JwtService";
import { GetTenantClient } from "../Utils/prismaClient";
import { MailService } from "./MailService/MailService";
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { NotFoundError } from "../Types/Errors";
import { logger } from "../Utils/Logger";
import { SemesterRepository } from "../Repositories/SemesterRepository";

export class UserService {

  public static async GetAllStaffAccounts(schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    return UserRepository.GetAllStaffAccounts(prisma);
  }

  public static async GetAllUsers(schema_name: string): Promise<User[]> {
    try {
      const prisma = GetTenantClient(schema_name);
      const users = await UserRepository.GetAllUsers(prisma);
      return users;
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      throw new Error(err.message || "Failed to fetch users.");
    }
  }

  public static async GetUserById(id: number, schema_name: string): Promise<User> {
    try {
      const prisma = GetTenantClient(schema_name);
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
      const prisma = GetTenantClient(schema_name);
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


  public static async UpdateUser(id: number, updateData: Partial<User>, schema_name: string): Promise<User> {
    try {
      const prisma = GetTenantClient(schema_name);
      const updatedUser = await UserRepository.UpdateUser(id, updateData, prisma);
      return updatedUser;
    } catch (err: any) {
      console.error("Error updating user:", err.message);
      throw new Error(err.message || "Failed to update user.");
    }
  }

  public static async DeleteUser(id: number, schema_name: string): Promise<User> {
    try {
      const prisma = GetTenantClient(schema_name);
      const deletedUser = await UserRepository.DeleteUser(id, prisma);
      return deletedUser;
    } catch (err: any) {
      console.error("Error deleting user:", err.message);
      throw new Error(err.message || "Failed to delete user.");
    }
  }

  public static async GetUserRoles(
    user_id: number,
    prisma: PrismaClient
  ): Promise<string[]> {
    const roles = await RBACRepository.GetUserRoles(user_id, prisma);
    return roles;
  }

  public static async GetUserPermissions(
    user_id: number,
    prisma: PrismaClient
  ): Promise<string[]> {
    const permissions = await RBACRepository.GetUserPermissions(user_id, prisma);
    return permissions;
  }

  public static async CreateStaffAccount(staff: IStaffAccount, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    const username = staff.username;
    const email = staff.email;
    const nationalId = staff.national_id;
    const roleNames = (staff.role_names || []).map((role) => role.trim()).filter(Boolean);

    if (!roleNames.length) {
      throw new Error("At least one role must be selected for the staff account");
    }

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

    const foundRoles = await RBACRepository.GetRolesByNames(roleNames, prisma);
    if (foundRoles.length !== roleNames.length) {
      const foundNames = foundRoles.map((role) => role.name);
      const missing = roleNames.filter((name) => !foundNames.includes(name));
      throw new Error(`Some roles not found: ${missing.join(", ")}`);
    }

    await RBACRepository.AssignRolesToUser(createdStaff.id, foundRoles, prisma);

    const publicPrisma = GetTenantClient("public");
    const universityName = await UniversityRepository.GetUniversityNameBySchema(schema_name, publicPrisma);
    if (!universityName) {
      throw new NotFoundError(`University with schema '${schema_name}' not found.`);
    }

    await MailService.SendVerificationStaffAccountMail(createdStaff.email, universityName);

    return createdStaff;
  }

  public static async ActivateStaffAccount(email: string, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    const user = await UserRepository.GetUserByEmail(email, prisma);
    if (!user) throw new NotFoundError("Staff account not found");

    const updated = await this.UpdateUser(user.id, { isVerified: true }, schema_name);
    return updated;
  }

  public static async UpdateStaffAccount(staffId: number, data: Partial<IStaffAccount>, schema_name: string) {
    const prisma = GetTenantClient(schema_name);

    const normalizedData: Partial<IStaffAccount> = { ...data };

    if (normalizedData.password) {
      normalizedData.password = await bcrypt.hash(normalizedData.password, 10);
    }

    if (normalizedData.salary !== undefined && normalizedData.salary !== null) {
      normalizedData.salary = Number(normalizedData.salary);
    }

    return UserRepository.UpdateStaffAccount(staffId, normalizedData, prisma);
  }

  public static async DeleteStaffAccount(staffId: number, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    return UserRepository.DeleteStaffAccount(staffId, prisma);
  }

  public static async Login(
    email: string,
    password: string,
    db_schema: string,
    university_name: string,
  ) {
    const prisma = GetTenantClient(db_schema);
    const [user , currentSemester] = await Promise.all([
      await UserRepository.GetUserWithProfileByEmail(email , prisma),
      await SemesterRepository.GetCurrentSemester(prisma , {id: true , year: true , term: true , type: true})
    ]);
    if (!user) {
      logger.warn({
        action: "UserService.Login",
        status: "failed",
        schema: db_schema,
        reason: "User Not Found"
      });
      return {
        status: StatusCodes.UNAUTHORIZED,
        body: {
          status: JSendStatus.FAIL,
          message: "Invalid Email Or Password.",
        },
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn({
        action: "UserService.Login",
        status: "failed",
        schema: db_schema,
        reason: "Invalid Password",
        userId: user.id
      });

      return {
        status: StatusCodes.UNAUTHORIZED,
        body: {
          status: JSendStatus.FAIL,
          message: "Invalid Email Or Password.",
        },
      };
    }

    if (!user.isVerified) {
      logger.warn({
        action: "UserService.Login",
        status: "failed",
        schema: db_schema,
        reason: "Email Not Verified",
        userId: user.id,
      });
      return {
        status: StatusCodes.FORBIDDEN,
        body: {
          status: JSendStatus.FAIL,
          data: {
            message: "Your Email Has Not Been Verified Yet. Please check your inbox.",
          },
        },
      };
    }

    if(user.isBlocked){
      logger.warn({
        action: "UserService.Login",
        status: "failed",
        schema: db_schema,
        reason: "User Is Blocked",
        userId: user.id
      });

      return {
        status: StatusCodes.FORBIDDEN,
        body: {
          status: JSendStatus.FAIL,
          data: {
            message: "Your account access has been restricted. Please reach out to your student affairs office for further information.",
          },
        },
      };
    }

    const {roles , permissions} = await RBACRepository.GetUserRolesAndPermissions(user.id , prisma);

    if (!roles || roles.length === 0) {
      logger.warn({
        action: "UserService.Login",
        status: "failed",
        schema: db_schema,
        reason: "No Roles Assigned",
        userId: user.id,
      });

      return {
        status: StatusCodes.FORBIDDEN,
        body: {
          status: JSendStatus.FAIL,
          message: "User Account Has No Roles Assigned. Please Contact Administrator.",
        },
      };
    }

    const token = JwtService.Sign({
      id:              user.id,
      email:           user.email,
      university_name,
      roles,
      permissions,
      isStaff:         !!user.staff,
      isStudent:       !!user.student,
      ...(user.student && {
        program: {
          id: user.student.program.id,
          programName: user.student.program.name,
        },
        programLevel: {
          id: user.student.programLevel.id,
          level: user.student.programLevel.level,
        },
        student: {
          fullname: user.student.fullname,
          nationalId: user.nationalId,
          cgpa: user.student.cgpa,
          gender: user.student.gender,
          religion: user.student.religion,
          universityStudentId: user.student.universityStudentId
        },
        semester: {
          id: currentSemester?.id,
          year: currentSemester?.year,
          type: currentSemester?.type,
          term: currentSemester?.term
        }
      }),
    });
    
    logger.info({
      action:   "UserService.Login",
      status:   "success",
      schema:   db_schema,
      userId:   user.id,
      isStaff:  !!user.staff,
      isStudent: !!user.student,
    });

    return {
      status: StatusCodes.OK,
      body: {
        status: JSendStatus.SUCCESS,
        message: "Login successful.",
        data: {
          token
        },
      },
    };
  }
}
