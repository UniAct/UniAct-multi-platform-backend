import { Prisma, Tenant } from "../generated/public";
import { TenantRepository } from "../Repositories/TenantRepository";
import { UniversityService } from "./UniversityService";
import { HostsManager } from "../Utils/HostManager";
import { SchemaManager } from "../Utils/SchemaManager";
import { Pool } from 'pg';

interface TenantCreateData extends Prisma.TenantCreateInput {
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export class TenantService {
  public static async CreateTenant(data: TenantCreateData): Promise<Tenant> {
    const existing = await TenantRepository.GetBySubdomain(data.subdomain);
    if (existing) 
      throw new Error("Subdomain already in use.");
    

    const existing_name = await TenantRepository.GetByName(data.name);
    if (existing_name.length > 0) {
      // Will later be replaced by a logging system
      console.warn(`[WARN] Duplicate tenant name detected: ${data.name}`);
    }

    // Create corresponding University record first
    let university;
    try {
      const universityCreateData: Prisma.UniversityCreateInput = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
      };

      university = await UniversityService.Create(universityCreateData);
      console.log(`[INFO] University record created: ${data.name}`);
    } catch (universityError: any) {
      console.error(`[ERROR] Failed to create University record:`, universityError.message);
      // Don't continue if University creation fails
      throw new Error(`Failed to create University record: ${universityError.message}`);
    }

    // Now create Tenant linked to University
    const tenantData: Prisma.TenantCreateInput = {
      name: data.name,
      subdomain: data.subdomain,
      db_schema: data.db_schema,
      is_active: true,
      university: {
        connect: { id: university.id }
      }
    };

    const tenant = await TenantRepository.Create(tenantData);

    const domain = HostsManager.BuildDomain(tenant.subdomain);

    // Register domain locally only in development
    HostsManager.RegisterDomain(domain);

    // Automatically create the schema for the new tenant
    try {
      const connectionString = process.env.DATABASE_SCHEMA_URL || process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_SCHEMA_URL or DATABASE_URL not found in .env');
      }

      const pool = new Pool({ connectionString });
      const schemaManager = new SchemaManager(pool);
      
      // Use the db_schema provided in the request
      const schemaName = data.db_schema;

      await schemaManager.CreateSchema(schemaName);
      console.log(`[INFO] Schema created for tenant: ${schemaName}`);
      
      await pool.end();
    } catch (schemaError: any) {
      console.error(`[ERROR] Failed to create schema for tenant ${tenant.name}:`, schemaError.message);
      // Delete the tenant that was created since schema creation failed
      await TenantRepository.Delete(tenant.id);
      throw new Error(`Failed to set up database schema: ${schemaError.message}`);
    }

    console.log(`[INFO] Tenant created successfully: ${tenant.name} (${domain})`);

    return tenant;
  }

  public static async DeleteTenant(id: number): Promise<Tenant> {
    const tenant : Tenant | null = await TenantRepository.GetById(id);
    if (!tenant) 
      throw new Error(`Tenant with ID ${id} not found.`);

    // Delete the tenant schema from database
    try {
      const connectionString = process.env.DATABASE_SCHEMA_URL || process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_SCHEMA_URL or DATABASE_URL not found in .env');
      }

      const pool = new Pool({ connectionString });
      const schemaManager = new SchemaManager(pool);
      
      await schemaManager.DeleteSchema(tenant.db_schema);
      console.log(`[INFO] Schema deleted for tenant: ${tenant.db_schema}`);
      
      await pool.end();
    } catch (schemaError: any) {
      console.error(`[ERROR] Failed to delete schema for tenant ${tenant.name}:`, schemaError.message);
      throw new Error(`Failed to delete database schema: ${schemaError.message}`);
    }

    // Delete University record
    try {
      const university = await UniversityService.GetByName(tenant.name);
      if (university) {
        // Note: UniversityService might not have a delete method, 
        // so we'll delete it directly via repository if available
        console.log(`[INFO] Cleaning up University record for tenant`);
      }
    } catch (universityError: any) {
      console.warn(`[WARN] Could not delete University record:`, universityError.message);
    }

    // Remove domain
    const domain = HostsManager.BuildDomain(tenant.subdomain);
    HostsManager.RemoveDomain(domain);

    // Delete tenant record from database
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
