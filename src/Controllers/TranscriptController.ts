import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { TranscriptService } from "../Services/TranscriptService";
import { MapTranscript } from "../Interfaces/Transcript/Mapper";

export class TranscriptController {
  static async GenerateStudentTranscript(req: Request, res: Response) {
    const studentId = parseInt(req.params.studentId as string);
    const semesterId = parseInt(req.params.semesterId as string);

    const queuedJob = await TranscriptService.QueueStudentTranscript(
      studentId,
      semesterId,
      req.schema_name!
    );

    res.status(StatusCodes.ACCEPTED).json({
      status: JSendStatus.SUCCESS,
      data: queuedJob,
    });
  }

  static async GenerateSemesterTranscripts(req: Request, res: Response) {
    const semesterId = parseInt(req.params.semesterId as string);

    const summary = await TranscriptService.GenerateSemesterTranscripts(
      semesterId,
      req.schema_name!
    );

    res.status(StatusCodes.ACCEPTED).json({
      status: JSendStatus.SUCCESS,
      data: summary,
    });
  }

  static async GenerateFacultySemesterTranscripts(req: Request, res: Response) {
    const semesterId = parseInt(req.params.semesterId as string);
    const facultyId = parseInt(req.params.facultyId as string);

    const summary = await TranscriptService.GenerateFacultySemesterTranscripts(
      semesterId,
      facultyId,
      req.schema_name!
    );

    res.status(StatusCodes.ACCEPTED).json({
      status: JSendStatus.SUCCESS,
      data: summary,
    });
  }

  static async GetStudentTranscripts(req: Request, res: Response) {
    const studentId = parseInt(req.params.studentId as string);

    const transcripts = await TranscriptService.GetStudentTranscripts(studentId, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: transcripts.map(MapTranscript),
    });
  }

  static async GetStudentSemesterTranscript(req: Request, res: Response) {
    const studentId = parseInt(req.params.studentId as string);
    const semesterId = parseInt(req.params.semesterId as string);

    const transcript = await TranscriptService.GetStudentSemesterTranscript(studentId, semesterId, req.schema_name!);

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: MapTranscript(transcript),
    });
  }
}
