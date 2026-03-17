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

  public static async GetAllStaffAccounts(prisma: PrismaClient) {
    return prisma.staff.findMany({
      include: {
        user: true,
      },
      orderBy: {
        user: {
          firstName: "asc",
        },
      },
    });
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

  public static async DeleteUser(id: number, prisma: PrismaClient): Promise<User> {
    const deletedUser = await prisma.user.delete({ where: { id } });
    return deletedUser;
  }

  public static async GetUserByUniqueFields(
    user: { email?: string; username?: string; nationalId?: string },
    prisma: PrismaClient
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

  public static async UpdateStaffAccount(
    userId: number,
    data: Partial<IStaffAccount>,
    prisma: PrismaClient
  ) {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.staff.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!existing) {
        throw new Error(`Staff account with ID ${userId} was not found`);
      }

      const userData: Prisma.UserUpdateInput = {};
      if (data.username !== undefined) userData.username = data.username;
      if (data.first_name !== undefined) userData.firstName = data.first_name;
      if (data.last_name !== undefined) userData.lastName = data.last_name;
      if (data.email !== undefined) userData.email = data.email;
      if (data.password !== undefined) userData.password = data.password;
      if (data.phone !== undefined) userData.phone = data.phone;
      if (data.date_of_birth !== undefined) userData.dateOfBirth = new Date(data.date_of_birth);
      if (data.address !== undefined) userData.address = data.address;
      if (data.city !== undefined) userData.city = data.city;
      if (data.country !== undefined) userData.country = data.country;
      if (data.national_id !== undefined) userData.nationalId = data.national_id;

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userData,
        });
      }

      const staffData: Prisma.StaffUpdateInput = {};
      if (data.position !== undefined) staffData.position = data.position;
      if (data.hireDate !== undefined) staffData.hireDate = new Date(data.hireDate);
      if (data.salary !== undefined) staffData.salary = data.salary as Prisma.Decimal | null;

      if (Object.keys(staffData).length > 0) {
        await tx.staff.update({
          where: { userId },
          data: staffData,
        });
      }

      return tx.staff.findUnique({
        where: { userId },
        include: { user: true },
      });
    });

    return updated;
  }

  public static async DeleteStaffAccount(userId: number, prisma: PrismaClient) {
    const existing = await prisma.staff.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!existing) {
      throw new Error(`Staff account with ID ${userId} was not found`);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return existing;
  }
}
