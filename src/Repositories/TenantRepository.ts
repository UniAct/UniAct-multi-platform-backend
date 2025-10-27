import { Prisma, PrismaClient, Tenant } from "../generated/public";
const prisma = new PrismaClient();

export class TenantRepository {
  public static async Create(
    data: Prisma.TenantCreateInput
  ): Promise<Tenant> {
    return await prisma.tenant.create({ data });
  }

  public static async GetByName(name: string): Promise<Tenant[]> {
    return await prisma.tenant.findMany({ where: { name } });
  }

  public static async GetBySubdomain(subdomain: string): Promise<Tenant | null> {
    return await prisma.tenant.findUnique({ where: { subdomain } });
  }

  public static async IsActive(id: number): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    return tenant?.is_active ?? false;
  }

  public static async Activate(id: number): Promise<Tenant> {
    return await prisma.tenant.update({
      where: { id },
      data: { is_active: true, updated_at: new Date() },
    });
  }

  public static async GetById(id: number): Promise<Tenant | null> {
    return await prisma.tenant.findUnique({ where: { id } });
  }

  public static async Delete(id: number): Promise<void> {
    await prisma.tenant.delete({ where: { id } });
  }

  public static async GetAll(): Promise<Tenant[]> {
    return await prisma.tenant.findMany();
  }
}
