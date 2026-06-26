import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TranscriptService } from "../Services/TranscriptService";
import { ForbiddenError } from "../Types/Errors";

export class TranscriptController {
  static async GenerateFacultySemesterTranscripts(req: Request, res: Response) {
    const semesterId = parseInt(req.params.semesterId as string);
    const facultyId = parseInt(req.params.facultyId as string);

    const queuedJob = await TranscriptService.QueueFacultySemesterTranscripts(
      semesterId,
      facultyId,
      req.schema_name!
    );

    res.status(StatusCodes.ACCEPTED).json({
      status: JSendStatus.SUCCESS,
      data: queuedJob,
    });
  }

  static async GetStudentTranscripts(req: Request, res: Response) {
    const studentId = parseInt(req.params.studentId as string);

    const transcripts = await TranscriptService.GetStudentTranscripts(studentId, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: transcripts,
    });
  }

  static async GetMyTranscripts(req: Request, res: Response) {
    if (!req.user?.id || !req.user.isStudent) {
      throw new ForbiddenError("Student account required.");
    }

    const transcripts = await TranscriptService.GetStudentTranscripts(req.user.id, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: transcripts,
    });
  }

  static async GenerateStudentTranscriptsForAllSemesters(req: Request, res: Response) {
    const studentId = parseInt(req.params.studentId as string);

    const transcripts = await TranscriptService.GenerateStudentTranscriptsForAllSemesters(
      studentId,
      req.schema_name!
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: transcripts,
    });
  }

  static async GetStudentSemesterTranscript(req: Request, res: Response) {
    const studentId = parseInt(req.params.studentId as string);
    const semesterId = parseInt(req.params.semesterId as string);

    const transcript = await TranscriptService.GetStudentSemesterTranscript(studentId, semesterId, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: transcript,
    });
  }
}
