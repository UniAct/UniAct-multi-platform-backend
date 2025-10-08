import bcrypt from "bcrypt";
import SuperAdminRepository from "../Repositories/SuperAdminRepository";
import { SuperAdmin } from "@prisma/client";

class SuperAdminService {
  public static async CreateSuperAdmin(
    username: string,
    email: string,
    password: string
  ): Promise<SuperAdmin> {
    const existing = await SuperAdminRepository.FindByEmail(email);
    if (existing) 
      throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    return await SuperAdminRepository.CreateSuperAdmin(
      username,
      email,
      hashedPassword
    );
  }

  public static async GetAllSuperAdmins(): Promise<SuperAdmin[]> {
    return await SuperAdminRepository.GetAllSuperAdmins();
  }

  public static async DeactivateSuperAdmin(username: string): Promise<SuperAdmin> {
    const admin = await SuperAdminRepository.DeactivateSuperAdmin(username);
    if (!admin) throw new Error("SuperAdmin not found");
    return admin;
  }

  public static async ActivateSuperAdmin(username: string): Promise<SuperAdmin> {
    const admin = await SuperAdminRepository.ActivateSuperAdmin(username);
    if (!admin) throw new Error("SuperAdmin not found");
    return admin;
  }

  public static async DeleteSuperAdmin(username: string): Promise<SuperAdmin> {
    const admin = await SuperAdminRepository.DeleteSuperAdmin(username);
    if (!admin) throw new Error("SuperAdmin not found");
    return admin;
  }
}

export default SuperAdminService;
