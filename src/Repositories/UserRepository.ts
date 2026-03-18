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
  return prisma.$transaction(async (tx) => {
    const existing = await tx.staff.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!existing) {
      throw new Error(`Staff account with ID ${userId} was not found`);
    }

      //Data mapper could be created later to make it even cleaner
    const userData = omitUndefined<Prisma.UserUpdateInput>({
      username: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      dateOfBirth: data.date_of_birth
        ? new Date(data.date_of_birth)
        : undefined,
      address: data.address,
      city: data.city,
      country: data.country,
      nationalId: data.national_id,
    });

    const staffData = omitUndefined<Prisma.StaffUpdateInput>({
      position: data.position,
      hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      salary: data.salary as Prisma.Decimal | null | undefined,
    });

    if (Object.keys(userData).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: userData,
      });
    }

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


//helper function to ignore any undefined fields passed to the updateStaffAccount instead of typing around 15 if condition :)
function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as T;
}