import { Prisma, PrismaClient, User } from "@prisma/client";
import { IStaffAccount } from "../Interfaces/StaffAccount";

export class UserRepository {

  public static async CreateUser(user_info: Prisma.UserCreateInput, prisma: PrismaClient): Promise<User> {
    const user = await prisma.user.create({ data: user_info });
    return user;
  }

  public static async GetAllUsers(prisma: PrismaClient): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users;
  }

  public static async GetUserById(id: number, prisma: PrismaClient): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  }

  public static async GetUserByEmail(email: string, prisma: PrismaClient): Promise<User | null> {

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.warn(`[WARN] No user found with email '${email}.`);
        return null;
      }

      return user;
    } catch (err) {
      console.error(`[ERROR] Failed to fetch user by email '${email}' from schema :`, err);
      throw new Error("Database error while fetching user by email.");
    }
  }


  public static async UpdateUser(
    id: number,
    updateData: Prisma.UserUpdateInput,
    prisma: PrismaClient
  ): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return updatedUser;
  }

  public static async DeleteUser(id: number, prisma : PrismaClient): Promise<User> {
    const deletedUser = await prisma.user.delete({ where: { id } });
    return deletedUser;
  }

  public static async GetUserByUniqueFields(
    user: { email?: string; username?: string; nationalId?: string },
    prisma:PrismaClient
  ): Promise<User | null> {

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: user.email },
          { username: user.username },
          { nationalId: user.nationalId },
        ],
      },
    });
    return existingUser;
  }

  public static async CreateStaffAccount(staff: IStaffAccount, prisma: PrismaClient) {

    try {
      const createdAccount = await prisma.user.create({
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

          staff: {
            create: {
              position: staff.position!,
              hireDate: new Date(staff.hireDate),
              salary: staff.salary,
            },
          },
        },
        include: {
          staff: true,
        },
      });

      return createdAccount;

    } catch (error) {
      console.error("Error creating staff account:", error);
      throw error;
    }
  }
}
