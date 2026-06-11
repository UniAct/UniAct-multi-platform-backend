import { Prisma, PrismaClient, UniversitySettings } from "@prisma/client";

export class UniversitySettingsRepository {
  public static async Upsert(
    university_id: number,
    data: Partial<Prisma.UniversitySettingsUpdateInput>,
    prisma: PrismaClient
  ): Promise<UniversitySettings> {
    return prisma.universitySettings.upsert({
      where: { university_id },
      update: data,
      create: {
        ...(data as Prisma.UniversitySettingsUncheckedCreateInput),
        university_id,
      },
    });
  }

  public static async GetByUniversityId(
    university_id: number,
    prisma: PrismaClient
  ): Promise<UniversitySettings | null> {
    return prisma.universitySettings.findUnique({
      where: { university_id },
    });
  }

  public static async GetBySchema(
    db_schema: string,
    prisma: PrismaClient
  ): Promise<UniversitySettings | null> {
    return prisma.universitySettings.findFirst({
      where: {
        university: {
          db_schema: {
            equals: db_schema,
            mode: "insensitive",
          },
        },
      },
    });
  }
}
