import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TranscriptService } from "../Services/TranscriptService";

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
