import { Prisma, PrismaClient, University, Tenant } from "../generated/public";
const prisma = new PrismaClient();

export class UniversityRepository {
  public static async Create(data: Prisma.UniversityCreateInput): Promise<University> {
    return await prisma.university.create({ data });
  }

  public static async GetById(id: number): Promise<University | null> {
    return await prisma.university.findUnique({
      where: { id },
    });
  }

  public static async GetByName(name: string): Promise<University | null> {
    return await prisma.university.findUnique({
      where: { name },
    });
  }

  public static async GetByIdWithTenants(id: number): Promise<University | null> {
    return await prisma.university.findUnique({
      where: { id },
      include: { tenants: true },
    });
  }

  public static async GetByNameWithTenants(name: string) : Promise<(University & { tenants: Tenant[] }) | null> {
    return await prisma.university.findUnique({
      where: { name },
      include: { tenants: true },
    });
  }

  public static async GetAll(): Promise<University[]> {
    return await prisma.university.findMany();
  }

  public static async Update(
    id: number,
    data: Prisma.UniversityUpdateInput
  ): Promise<University> {
    return await prisma.university.update({
      where: { id },
      data,
    });
  }

  public static async Delete(id: number): Promise<void> {
    await prisma.university.delete({
      where: { id },
    });
  }

  public static async GetTenants(universityId: number): Promise<Tenant[]> {
    const university = await prisma.university.findUnique({
      where: { id: universityId },
      include: { tenants: true },
    });
    return university?.tenants ?? [];
  }

  public static async AssignTenant(
    tenant_id: number,
    university_id: number
  ): Promise<Tenant> {
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant_id },
      data: { university_id  , is_active: true},
    });

    return updatedTenant;
  }
}
