import { Prisma } from "@prisma/client";
import { User } from "../generated/tenants/alexandria_national_university";
import { IStaffAccount } from "../Interfaces/StaffAccount";
import { SchemaManager } from "../Utils/SchemaManager"; // adjust path to your SchemaManager

export class UserRepository {

  public static async CreateUser(user_info: Omit<User, "id">, schema_name: string): Promise<User> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const user = await tenant_schema.user.create({ data: user_info });
    await tenant_schema.$disconnect();
    return user;
  }

  public static async GetAllUsers(schema_name: string): Promise<User[]> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const users = await tenant_schema.user.findMany();
    await tenant_schema.$disconnect();
    return users;
  }

  public static async GetUserById(id: number, schema_name: string): Promise<User | null> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const user = await tenant_schema.user.findUnique({ where: { id } });
    await tenant_schema.$disconnect();
    return user;
  }

  public static async GetUserByEmail(email: string, schema_name: string): Promise<User | null> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);

    try {
      const user = await tenant_schema.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.warn(`[WARN] No user found with email '${email}' in schema '${schema_name}'.`);
        return null;
      }

      return user;
    } catch (err) {
      console.error(`[ERROR] Failed to fetch user by email '${email}' from schema '${schema_name}':`, err);
      throw new Error("Database error while fetching user by email.");
    } finally {
      await tenant_schema.$disconnect();
    }
  }


  public static async UpdateUser(
    id: number,
    updateData: Partial<User>,
    schema_name: string
  ): Promise<User> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const updatedUser = await tenant_schema.user.update({
      where: { id },
      data: updateData,
    });
    await tenant_schema.$disconnect();
    return updatedUser;
  }

  public static async DeleteUser(id: number, schema_name: string): Promise<User> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);
    const deletedUser = await tenant_schema.user.delete({ where: { id } });
    await tenant_schema.$disconnect();
    return deletedUser;
  }

  public static async GetUserByFields(
    user: Pick<User, "email" | "username" | "nationalId">,
    schema_name: string
  ): Promise<User | null> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);

    try {
      const existingUser = await tenant_schema.user.findFirst({
        where: {
          OR: [
            { email: user.email },
            { username: user.username },
            { nationalId: user.nationalId },
          ],
        },
      });
      return existingUser;
    } finally {
      await tenant_schema.$disconnect();
    }
  }
  public static async GetStaffByFields(
    user: {email : string , username : string , nationalId : string},
    schema_name: string
  ): Promise<User | null> {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);

    try {
      const existingUser = await tenant_schema.user.findFirst({
        where: {
          OR: [
            { email: user.email },
            { username: user.username },
            { nationalId: user.nationalId },
          ],
        },
      });
      return existingUser;
    } finally {
      await tenant_schema.$disconnect();
    }
  }

  public static async CreateStaffAccount(staff: IStaffAccount, schema_name: string) {
    const tenant_schema = SchemaManager.GetTenantPrismaClient(schema_name);

    try {
      const createdAccount = await tenant_schema.$transaction(async (tx: Prisma.TransactionClient) => {
        const newUser = await tx.user.create({
          data: {
            username: staff.username,
            firstName: staff.first_name,
            lastName: staff.last_name,
            email: staff.email,
            password: staff.password,
            phone: staff.phone!,
            dateOfBirth: new Date(staff.date_of_birth),
            address: staff.address!,
            city: staff.city!,
            country: staff.country!,
            nationalId: staff.national_id,
          },
        });

        const newStaff = await tx.staff.create({
          data: {
            userId: newUser.id,
            position: staff.position!,
            cvPath: staff.cv,
            hireDate: new Date(staff.hireDate),
            salary: staff.salary,
          },
        });

        return { user: newUser, staff: newStaff };
      });

      return createdAccount;
    } catch (error) {
      console.error("Error creating staff account:", error);
      throw error;
    } finally {
      await tenant_schema.$disconnect();
    }
  }

}
