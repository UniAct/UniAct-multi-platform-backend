import { Prisma, PrismaClient, University } from "@prisma/client"

export class UniversityRepository {
  public static async Create(data: Prisma.UniversityCreateInput, prisma: PrismaClient): Promise<University> {

    return await prisma.university.create({ data });
  }

  public static async GetById(id: number, prisma: PrismaClient): Promise<University | null> {
    return await prisma.university.findUnique({
      where: { id },
    });
  }

  public static async GetByName(name: string, prisma: PrismaClient): Promise<University | null> {
    const normalizedName = name.trim();

    return await prisma.university.findUnique({
      where: {
        name: normalizedName,
      },
    });
  }

  public static async GetAll(prisma: PrismaClient): Promise<University[]> {
    return await prisma.university.findMany();
  }

  public static async ListNames(prisma: PrismaClient): Promise<string[]> {
    const universities = await prisma.university.findMany({
      select: { name: true },
    });

    return universities.map(u => u.name);
  }


  public static async Update(
    id: number,
    data: Prisma.UniversityUpdateInput,
    prisma: PrismaClient
  ): Promise<University> {
    return await prisma.university.update({
      where: { id },
      data,
    });
  }

  public static async Delete(id: number, prisma: PrismaClient): Promise<void> {
    await prisma.university.delete({
      where: { id },
    });
  }

  public static async GetUniversityBySchemaName(
    db_schema: string,
    prisma: PrismaClient
  ): Promise<University | null> {
    return await prisma.university.findUnique({
      where: { db_schema },
    });
  }

  public static async Activate(id: number, prisma: PrismaClient): Promise<University> {
    return await prisma.university.update({
      where: { id },
      data: { is_active: true },
    });
  }

  public static async Deactivate(id: number, prisma: PrismaClient): Promise<University> {
    return await prisma.university.update({
      where: { id },
      data: { is_active: false },
    });
  }

  public static async GetUniversityNameBySchema(
    db_schema: string,
    prisma: PrismaClient
  ): Promise<string | null> {
    const university = await prisma.university.findUnique({
      where: { db_schema },
      select: { name: true },
    });

    return university?.name ?? null;
  }

}
