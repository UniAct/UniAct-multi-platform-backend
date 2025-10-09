import bcrypt from "bcrypt";
import SuperAdminRepository from "../Repositories/SuperAdminRepository";
import { SuperAdmin } from "@prisma/client";

class SuperAdminService {
  public static async CreateSuperAdmin(
    username: string,
    email: string,
    password: string
  ): Promise<SuperAdmin> {
    const existing = await SuperAdminRepository.IsExists(username , email);
    if (existing) 
      throw new Error("Email or Username already exist");

    const hashedPassword = await bcrypt.hash(password, 10);

    return await SuperAdminRepository.Create(
      username,
      email,
      hashedPassword
    );
  }

  public static async GetSuperAdminByEmail(email : string) : Promise<SuperAdmin | null> {
    return await SuperAdminRepository.FindByEmail(email);
  }

  public static async GetAllSuperAdmins(): Promise<SuperAdmin[]> {
    return await SuperAdminRepository.GetAllSuperAdmins();
  }

  public static async ActivateSuperAdmin(email: string): Promise<SuperAdmin> {
    const admin = await SuperAdminRepository.ActivateSuperAdmin(email);
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
