import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { GetTenantClient } from "../Utils/prismaClient";

function normalizeAnnouncementPayload(body: any) {
  return {
    title: body.title,
    content: body.content,
    type: body.type ?? "ANNOUNCEMENT",
    audience: body.audience ?? "ALL",
    status: body.status ?? "PUBLISHED",
    event_date: body.event_date ?? null,
    event_location: body.event_location ?? null,
  };
}

export class AnnouncementController {
  public static async GetPublic(req: Request, res: Response) {
    const schema = String(req.params.schema || "").trim().toLowerCase();
    const prisma = GetTenantClient(schema);

    const items = await (prisma as any).$queryRawUnsafe(
      `SELECT id, title, content, type, audience, status, event_date, event_location, author_id, created_at, updated_at
       FROM "${schema}"."Announcement"
       WHERE status = 'PUBLISHED' AND audience IN ('ALL', 'STUDENTS')
       ORDER BY created_at DESC
       LIMIT 10`
    );

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: items,
    });
  }

  public static async GetAll(req: Request, res: Response) {
    const schema = req.schema_name!;
    const prisma = GetTenantClient(schema);

    const items = await (prisma as any).$queryRawUnsafe(
      `SELECT id, title, content, type, audience, status, event_date, event_location, author_id, created_at, updated_at
       FROM "${schema}"."Announcement"
       ORDER BY created_at DESC`
    );

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: items,
    });
  }

  public static async Create(req: Request, res: Response) {
    const schema = req.schema_name!;
    const author_id = Number(req.user?.id);

    if (!Number.isInteger(author_id)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: JSendStatus.FAIL,
        data: { message: "Authenticated user id is required" },
      });
    }

    const { title, content, type, audience, status, event_date, event_location } =
      normalizeAnnouncementPayload(req.body);
    const prisma = GetTenantClient(schema);

    const result = await (prisma as any).$queryRawUnsafe(
      `INSERT INTO "${schema}"."Announcement"
       (title, content, type, audience, status, event_date, event_location, author_id)
       VALUES ($1, $2, CAST($3 AS "${schema}"."AnnouncementType"), CAST($4 AS "${schema}"."AnnouncementAudience"), CAST($5 AS "${schema}"."AnnouncementStatus"), $6, $7, $8)
       RETURNING id, title, content, type, audience, status, event_date, event_location, author_id, created_at, updated_at`,
      title,
      content,
      type,
      audience,
      status,
      event_date,
      event_location,
      author_id
    );

    return res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data: result[0],
    });
  }

  public static async Update(req: Request, res: Response) {
    const schema = req.schema_name!;
    const id = Number(req.params.id);
    const { title, content, type, audience, status, event_date, event_location } =
      normalizeAnnouncementPayload(req.body);
    const prisma = GetTenantClient(schema);

    const result = await (prisma as any).$queryRawUnsafe(
      `UPDATE "${schema}"."Announcement"
       SET title = $1,
           content = $2,
           type = CAST($3 AS "${schema}"."AnnouncementType"),
           audience = CAST($4 AS "${schema}"."AnnouncementAudience"),
           status = CAST($5 AS "${schema}"."AnnouncementStatus"),
           event_date = $6,
           event_location = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, title, content, type, audience, status, event_date, event_location, author_id, created_at, updated_at`,
      title,
      content,
      type,
      audience,
      status,
      event_date,
      event_location,
      id
    );

    if (!result[0]) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { message: "Announcement not found" },
      });
    }

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result[0],
    });
  }

  public static async Delete(req: Request, res: Response) {
    const schema = req.schema_name!;
    const id = Number(req.params.id);
    const prisma = GetTenantClient(schema);

    await (prisma as any).$queryRawUnsafe(
      `DELETE FROM "${schema}"."Announcement" WHERE id = $1`,
      id
    );

    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: { message: "Deleted" },
    });
  }
}
