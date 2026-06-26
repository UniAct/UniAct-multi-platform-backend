import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { AiService } from "../Services/AiService";
import { BadRequestError } from "../Types/Errors";

function getSingleParam(value: string | string[] | undefined, name: string): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  throw new BadRequestError(`${name} must be a single non-empty string.`);
}

export class AiController {
  static async Health(_req: Request, res: Response) {
    const health = await AiService.Health();
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data: health });
  }

  static async GetGroupFiles(req: Request, res: Response) {
    const data = await AiService.GetProjectFiles(req.schema_name!, Number(req.params.groupId));
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async GetGroupChapters(req: Request, res: Response) {
    const data = await AiService.GetProjectChapters(req.schema_name!, Number(req.params.groupId));
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async GetIndexInfo(req: Request, res: Response) {
    const data = await AiService.GetIndexInfo(req.schema_name!, Number(req.params.groupId));
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async SyncGroupMaterials(req: Request, res: Response) {
    const data = await AiService.SyncGroupMaterials(req.schema_name!, Number(req.params.groupId));
    res.status(StatusCodes.ACCEPTED).json({
      status: JSendStatus.SUCCESS,
      data,
      message: "Learning group materials synchronized with AI.",
    });
  }

  static async CreateSession(req: Request, res: Response) {
    const data = await AiService.CreateSession(req.schema_name!, Number(req.params.groupId), req.body?.title);
    res.status(StatusCodes.CREATED).json({ status: JSendStatus.SUCCESS, data });
  }

  static async ListSessions(req: Request, res: Response) {
    const data = await AiService.ListSessions(req.schema_name!, Number(req.params.groupId));
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async GetSessionHistory(req: Request, res: Response) {
    const sessionId = getSingleParam(req.params.sessionId, "sessionId");
    const data = await AiService.GetSessionHistory(req.schema_name!, sessionId);
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async Chat(req: Request, res: Response) {
    const data = await AiService.Chat(
      req.schema_name!,
      Number(req.params.groupId),
      Number(req.user?.id),
      req.body
    );

    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async Summarize(req: Request, res: Response) {
    const data = await AiService.Summarize(req.schema_name!, Number(req.params.groupId), req.body ?? {});
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async Exam(req: Request, res: Response) {
    const data = await AiService.Exam(req.schema_name!, Number(req.params.groupId), req.body ?? {});
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async MindMap(req: Request, res: Response) {
    const data = await AiService.MindMap(req.schema_name!, Number(req.params.groupId), req.body ?? {});
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async Search(req: Request, res: Response) {
    const data = await AiService.Search(req.schema_name!, Number(req.params.groupId), req.body ?? {});
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async ListStudyFiles(req: Request, res: Response) {
    const data = await AiService.ListStudyFiles(req.schema_name!, Number(req.params.groupId));
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async GetStudyData(req: Request, res: Response) {
    const fileId = getSingleParam(req.params.fileId, "fileId");
    const data = await AiService.GetStudyData(req.schema_name!, Number(req.params.groupId), fileId);
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }

  static async SaveStudyData(req: Request, res: Response) {
    const fileId = getSingleParam(req.params.fileId, "fileId");
    const data = await AiService.SaveStudyData(req.schema_name!, Number(req.params.groupId), fileId, req.body ?? {});
    res.status(StatusCodes.OK).json({ status: JSendStatus.SUCCESS, data });
  }
}
