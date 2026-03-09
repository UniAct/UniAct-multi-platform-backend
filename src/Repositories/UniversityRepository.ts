import { Prisma, PrismaClient, University } from "../generated/public";
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

  public static async GetAll(): Promise<University[]> {
    return await prisma.university.findMany();
  }

  public static async ListNames(): Promise<string[]> {
    const universities = await prisma.university.findMany({
      select: { name: true },
    });

    return universities.map(u => u.name);
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

  public static async GetBySchema(
    db_schema: string
  ): Promise<University | null> {
    return await prisma.university.findUnique({
      where: { db_schema },
    });
  }

  public static async Activate(id: number): Promise<University> {
    return await prisma.university.update({
      where: { id },
      data: { is_active: true },
    });
  }

  public static async Deactivate(id: number): Promise<University> {
    return await prisma.university.update({
      where: { id },
      data: { is_active: false },
    });
  }

  public static async GetUniversityNameBySchema(
    db_schema: string
  ): Promise<string | null> {
    const university = await prisma.university.findUnique({
      where: { db_schema },
      select: { name: true },
    });

    return university?.name ?? null;
  }

}
