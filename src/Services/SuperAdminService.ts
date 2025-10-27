import bcrypt from "bcrypt";
import SuperAdminRepository from "../Repositories/SuperAdminRepository";
import { SuperAdmin } from "../generated/public";

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
    if (!admin) throw new Error("SuperAdmin Not Found");
    return admin;
  }

  public static async DeleteSuperAdmin(username: string): Promise<SuperAdmin> {
    const admin = await SuperAdminRepository.DeleteSuperAdmin(username);
    if (!admin) throw new Error("SuperAdmin Not Found");
    return admin;
  }

  public static async ActivateRootAccount(email : string , university_name : string){
    const root_account = await SuperAdminRepository.ActivateRootAccount(email , university_name);
    if (!root_account) throw new Error("Root Account Not Found");
    return root_account;
  }
}

export default SuperAdminService;
