import { Prisma, Tenant } from "../generated/public";
import { TenantRepository } from "../Repositories/TenantRepository";
import { HostsManager } from "../Utils/HostManager";

export class TenantService {
  public static async CreateTenant(data: Prisma.TenantCreateInput): Promise<Tenant> {
    const existing = await TenantRepository.GetBySubdomain(data.subdomain);
    if (existing) 
      throw new Error("Subdomain already in use.");
    

    const existing_name = await TenantRepository.GetByName(data.name);
    if (existing_name.length > 0) {
      // Will later be replaced by a logging system
      console.warn(`[WARN] Duplicate tenant name detected: ${data.name}`);
    }

    const tenant = await TenantRepository.Create(data);

    const domain = HostsManager.BuildDomain(tenant.subdomain);

    // Register domain locally only in development
    HostsManager.RegisterDomain(domain);

    console.log(`[INFO] Tenant created successfully: ${tenant.name} (${domain})`);

    return tenant;
  }

  public static async DeleteTenant(id: number): Promise<Tenant> {
    const tenant : Tenant | null = await TenantRepository.GetById(id);
    if (!tenant) 
      throw new Error(`Tenant with ID ${id} not found.`);

    const domain = HostsManager.BuildDomain(tenant.subdomain);
    HostsManager.RemoveDomain(domain);

    await TenantRepository.Delete(id);
    console.log(`[INFO] Tenant deleted: ${tenant.name} (${domain})`);

    return tenant; 
  }

  public static async GetAll() : Promise<Tenant[]> {
    return await TenantRepository.GetAll();
  }
  
  public static async GetById(id: number): Promise<Tenant> {
    const tenant : Tenant | null = await TenantRepository.GetById(id);
    if (!tenant) {
      throw new Error(`Tenant with ID ${id} not found.`);
    }
    return tenant;
  }

  public static async GetBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant: Tenant | null = await TenantRepository.GetBySubdomain(subdomain);

    if (!tenant) {
      throw new Error(`Tenant with subdomain '${subdomain}' not found.`);
    }

    return tenant;
  }
}
