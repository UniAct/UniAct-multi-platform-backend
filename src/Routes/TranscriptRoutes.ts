import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { TranscriptController } from "../Controllers/TranscriptController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import JSendStatus from "../Enums/Jsend";
import TranscriptValidator from "../Interfaces/Transcript/TranscriptValidator";

const router = Router();

router.get(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  (req, res) => {
    return res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: {
        message: "Transcript API root",
        availableRoutes: [
          "/students/:studentId/semesters/:semesterId/generate",
          "/semesters/:semesterId/generate",
          "/semesters/:semesterId/faculties/:facultyId/generate",
          "/students/:studentId",
          "/students/:studentId/semesters/:semesterId",
        ],
      },
    });
  }
);

router.post(
  "/students/:studentId/semesters/:semesterId/generate",
  IsAuthenticated,
  AttachAndValidateTenant,
  ...TranscriptValidator.GenerateStudentTranscript(),
  ValidateRequest,
  asyncHandler(TranscriptController.GenerateStudentTranscript)
);

router.post(
  "/semesters/:semesterId/generate",
  IsAuthenticated,
  AttachAndValidateTenant,
  ...TranscriptValidator.GenerateSemesterTranscripts(),
  ValidateRequest,
  asyncHandler(TranscriptController.GenerateSemesterTranscripts)
);

router.post(
  "/semesters/:semesterId/faculties/:facultyId/generate",
  IsAuthenticated,
  AttachAndValidateTenant,
  ...TranscriptValidator.GenerateSemesterTranscriptsByFaculty(),
  ValidateRequest,
  asyncHandler(TranscriptController.GenerateFacultySemesterTranscripts)
);

router.get(
  "/students/:studentId",
  IsAuthenticated,
  AttachAndValidateTenant,
  ...TranscriptValidator.StudentIdParam(),
  ValidateRequest,
  asyncHandler(TranscriptController.GetStudentTranscripts)
);

router.get(
  "/students/:studentId/semesters/:semesterId",
  IsAuthenticated,
  AttachAndValidateTenant,
  ...TranscriptValidator.StudentSemesterParams(),
  ValidateRequest,
  asyncHandler(TranscriptController.GetStudentSemesterTranscript)
);

export default router;
