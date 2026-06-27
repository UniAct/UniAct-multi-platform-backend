import { Prisma, PrismaClient, University } from "@prisma/client"
import { UniversityRepository } from "../Repositories/UniversityRepository";
import { Pool } from "pg";
import { SchemaManager } from "../Utils/SchemaManager";
import { GetTenantClient } from "../Utils/prismaClient";
import { NotFoundError } from "../Types/Errors";
import { logger } from "../Utils/Logger";
import { MinioRepository } from "../Repositories/MinioRepository";
import { UniversitySettingsRepository } from "../Repositories/UniversitySettingsRepository";
import { deleteFromCloudinary, uploadToCloudinary } from "../Utils/ImageUpload";

export class UniversityService {

  public static async Create(
    data: Prisma.UniversityCreateInput,
  ): Promise<University> {

    const prisma = GetTenantClient("public");

    const university = await UniversityRepository.Create(data, prisma);
    await UniversitySettingsRepository.Upsert(university.id, {}, prisma);

    try {

      await SchemaManager.createTenant(university.db_schema);

      logger.info(
        {
          action: "UniversityService.Create",
          university_name: university.name,
          status: "success"
        }
      );

      await MinioRepository.CreateBucket(university.db_schema);

      return university;
    } catch (err) {
      throw err;
    }
  }

  public static async GetById(id: number): Promise<University> {

    const prisma = GetTenantClient("public");
    const university = await UniversityRepository.GetById(id, prisma);
    if (!university)
      throw new NotFoundError(`University with Id ${id} not found.`);

    return university;
  }

  public static async GetByName(university_name: string,): Promise<University> {

    const prisma = GetTenantClient("public");
    const university = await UniversityRepository.GetByName(university_name, prisma);

    if (!university)
      throw new NotFoundError(`University with name '${university_name}' not found.`);

    return university;
  }

  public static async GetUniversityBySchemaName(db_schema: string): Promise<University> {

    const prisma = GetTenantClient("public");
    const university = await UniversityRepository.GetUniversityBySchemaName(db_schema, prisma);

    if (!university)
      throw new NotFoundError(`University with schema '${db_schema}' not found.`);

    return university;
  }

  public static async GetPublicProfile(db_schema: string) {
    const prisma = GetTenantClient("public");
    const university = await UniversityRepository.GetPublicProfileBySchemaName(db_schema, prisma);

    if (!university) {
      throw new NotFoundError(`University with schema '${db_schema}' not found.`);
    }

    return {
      ...university,
      settings: university.settings ?? this.GetDefaultSettings(university.id),
    };
  }

  public static async GetTenantAnalytics(db_schema: string) {
    const schema = db_schema.trim().toLowerCase();
    const prisma = GetTenantClient(schema);

    const todayAbsencesQuery = `
      SELECT
        p.id AS "programId",
        p.name AS "programName",
        pl.id AS "levelId",
        pl.level AS "level",
        COUNT(sa.id)::int AS "absences"
      FROM "${schema}"."StudentAttendance" sa
      INNER JOIN "${schema}"."AttendanceSession" ats ON ats.id = sa.attendance_session_id
      INNER JOIN "${schema}"."Student" s ON s.user_id = sa.student_id
      INNER JOIN "${schema}"."Program" p ON p.id = s.program_id
      INNER JOIN "${schema}"."ProgramLevel" pl ON pl.id = s.program_level_id
      WHERE sa.status = 'Absent'::"${schema}"."AttendanceStatus"
        AND ats.session_date = CURRENT_DATE
      GROUP BY p.id, p.name, pl.id, pl.level
      ORDER BY p.name ASC, pl.level ASC
    `;

    const upcomingItemsQuery = `
      SELECT
        id,
        title,
        content AS description,
        type,
        COALESCE(event_date, created_at)::date AS date,
        event_location AS "location"
      FROM "${schema}"."Announcement"
      WHERE status = 'PUBLISHED'::"${schema}"."AnnouncementStatus"
        AND COALESCE(event_date, created_at)::date >= CURRENT_DATE
      ORDER BY COALESCE(event_date, created_at) ASC, created_at DESC
      LIMIT 40
    `;

    const [studentCount, staffCount, adminCount, learningGroupCount, absenceRows, upcomingItems] =
      await Promise.all([
        prisma.student.count(),
        prisma.staff.count(),
        prisma.userRole.count({
          where: {
            role: {
              name: { in: ["Admin", "Root"] },
            },
          },
        }),
        prisma.learningGroup.count(),
        (prisma as any).$queryRawUnsafe(todayAbsencesQuery),
        (prisma as any).$queryRawUnsafe(upcomingItemsQuery),
      ]);

    const programMap = new Map<
      number,
      {
        id: number;
        name: string;
        absences: number;
        levels: { id: number; name: string; absences: number }[];
      }
    >();

    for (const row of absenceRows as Array<{
      programId: number;
      programName: string;
      levelId: number;
      level: number;
      absences: number;
    }>) {
      const existing = programMap.get(row.programId) ?? {
        id: row.programId,
        name: row.programName,
        absences: 0,
        levels: [],
      };

      existing.absences += Number(row.absences);
      existing.levels.push({
        id: row.levelId,
        name: `Level ${row.level}`,
        absences: Number(row.absences),
      });

      programMap.set(row.programId, existing);
    }

    return {
      summary: {
        students: studentCount,
        staff: staffCount,
        admins: adminCount,
        activeTeams: learningGroupCount,
      },
      todayAbsences: Array.from(programMap.values()).sort((a, b) => b.absences - a.absences),
      upcomingItems,
      generatedAt: new Date().toISOString(),
    };
  }

  public static async ListNames(): Promise<string[]> {

    const prisma = GetTenantClient("public");
    return await UniversityRepository.ListNames(prisma);
  }

  public static async GetAll(): Promise<University[]> {

    const prisma = GetTenantClient("public");
    return await UniversityRepository.GetAll(prisma);
  }

  public static async DeleteUniversity(id: number,): Promise<University> {

    const prisma = GetTenantClient("public");
    const university = await UniversityRepository.GetById(id, prisma);

    if (!university) {
      throw new NotFoundError(`University with ID ${id} not found.`);
    }

    await UniversityRepository.Delete(id, prisma);


    await SchemaManager.deleteSchema(university.db_schema);

    await MinioRepository.DeleteBucket(university.db_schema);

    logger.info(
      {
        action: "UniversityService.DeleteUniversity",
        university_name: university.name,
        status: "success"
      }
    );
    return university;
  }

  public static async Activate(id: number,): Promise<University> {

    const prisma = GetTenantClient("public");
    const university = await UniversityRepository.GetById(id, prisma);
    if (!university) {
      throw new NotFoundError(`University with id '${id}' does not exist`);
    }

    return await UniversityRepository.Activate(id, prisma);
  }

  public static async Deactivate(id: number,): Promise<University> {

    const prisma = GetTenantClient("public");
    const university = await UniversityRepository.GetById(id, prisma);
    if (!university) {
      throw new NotFoundError(`University with id '${id}' does not exist`);
    }

    return await UniversityRepository.Deactivate(id, prisma);
  }

  public static async GetSettings(university_id: number) {
    const prisma = GetTenantClient("public");
    return (
      (await UniversitySettingsRepository.GetByUniversityId(university_id, prisma)) ??
      this.GetDefaultSettings(university_id)
    );
  }

  public static async UpdateSettings(
    university_id: number,
    data: {
      primary_color?: string;
      secondary_color?: string;
      tab_name?: string | null;
      logo_url?: string | null;
    }
  ) {
    const prisma = GetTenantClient("public");
    return UniversitySettingsRepository.Upsert(university_id, data, prisma);
  }

  public static async UploadLogo(
    university_id: number,
    db_schema: string,
    file: Express.Multer.File
  ): Promise<string> {
    const prisma = GetTenantClient("public");
    const existing = await UniversitySettingsRepository.GetByUniversityId(university_id, prisma);

    if (existing?.logo_url) {
      await deleteFromCloudinary(existing.logo_url).catch(() => undefined);
    }

    const url = await uploadToCloudinary(
      file.buffer,
      `universities/${db_schema}/logos`,
      `${db_schema}_logo`
    );

    await UniversitySettingsRepository.Upsert(university_id, { logo_url: url }, prisma);
    return url;
  }

  public static async UploadHeroImage(
    university_id: number,
    db_schema: string,
    file: Express.Multer.File
  ): Promise<string[]> {
    const prisma = GetTenantClient("public");
    const existing = await UniversitySettingsRepository.GetByUniversityId(university_id, prisma);
    const currentImages = existing?.hero_images ?? [];

    if (currentImages.length >= 6) {
      throw new Error("Maximum of 6 campus images reached.");
    }

    const url = await uploadToCloudinary(
      file.buffer,
      `universities/${db_schema}/hero`,
      `${db_schema}_hero_${Date.now()}`
    );

    const hero_images = [...currentImages, url];
    await UniversitySettingsRepository.Upsert(university_id, { hero_images }, prisma);

    return hero_images;
  }

  public static async DeleteHeroImage(university_id: number, url: string): Promise<string[]> {
    const prisma = GetTenantClient("public");
    const existing = await UniversitySettingsRepository.GetByUniversityId(university_id, prisma);
    const hero_images = (existing?.hero_images ?? []).filter((item) => item !== url);

    if (url) {
      await deleteFromCloudinary(url).catch(() => undefined);
    }

    await UniversitySettingsRepository.Upsert(university_id, { hero_images }, prisma);
    return hero_images;
  }

  private static GetDefaultSettings(university_id: number) {
    return {
      id: 0,
      university_id,
      primary_color: "#2563eb",
      secondary_color: "#7c3aed",
      tab_name: null,
      logo_url: null,
      hero_images: [],
      updated_at: new Date(),
    };
  }


}
