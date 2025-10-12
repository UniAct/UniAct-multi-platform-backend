import { PrismaClient, SuperAdmin } from "@prisma/client";
const prisma = new PrismaClient();

class SuperAdminRepository {
  public static async Create(
    username: string,
    email: string,
    password: string
  ): Promise<SuperAdmin> {
    try {
      const newSuperAdmin : SuperAdmin = await prisma.superAdmin.create({
        data: {
          username,
          email,
          password,
        },
      });

      return newSuperAdmin;
    } catch (err: any) {
      console.error("Error Creating SuperAdmin:", err);
      throw err;
    }
  }

  public static async FindByEmail(email: string): Promise<SuperAdmin | null> {
    return await prisma.superAdmin.findUnique({
      where: { email },
    });
  }

  public static async FindByUsername(username: string): Promise<SuperAdmin | null> {
    return await prisma.superAdmin.findUnique({
      where: { username },
    });
  }

  public static async IsExists(username: string, email: string): Promise<SuperAdmin | null> {
      return await prisma.superAdmin.findFirst({
          where: {
              OR: [
                  { username },
                  { email }
              ]
          }
      });

  }

  public static async GetAllSuperAdmins(): Promise<SuperAdmin[]> {
    try {
      return await prisma.superAdmin.findMany({
        orderBy: { username: "asc" },
      });
    } catch (err: any) {
      console.error("Error Fetching SuperAdmins:", err);
      throw err;
    }
  }

  public static async ActivateSuperAdmin(email: string): Promise<SuperAdmin> {
    try {
      const admin = await prisma.superAdmin.update({
        where: { email },
        data: { is_active: true },
      });
      return admin;
    } catch (err: any) {
      console.error("Error Activating SuperAdmin:", err);
      throw err;
    }
  }

  public static async DeleteSuperAdmin(username: string): Promise<SuperAdmin> {
    try {
      const deletedAdmin = await prisma.superAdmin.delete({
        where: { username },
      });
      return deletedAdmin;
    } catch (err: any) {
      console.error("Error Deleting SuperAdmin:", err);
      throw err;
    }
  }

  public static async CountSuperAdmins() : Promise<number> {
    return await prisma.superAdmin.count();
  }
}

export default SuperAdminRepository;
