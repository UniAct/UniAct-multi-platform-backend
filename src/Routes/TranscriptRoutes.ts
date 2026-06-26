import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { TranscriptController } from "../Controllers/TranscriptController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import JSendStatus from "../Enums/Jsend";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { FacultySemesterParamsSchema, StudentIdParamSchema, StudentSemesterParamsSchema } from "../Interfaces/Transcript/TranscriptValidator";

const router = Router();



router.post(
  "/semesters/:semesterId/faculties/:facultyId/generate",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ params: FacultySemesterParamsSchema }),
  asyncHandler(TranscriptController.GenerateFacultySemesterTranscripts)
);

router.get(
  "/me",
  IsAuthenticated,
  AttachAndValidateTenant,
  asyncHandler(TranscriptController.GetMyTranscripts)
);

// add each course with its grade
router.get(
  "/students/:studentId",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ params: StudentIdParamSchema }),
  asyncHandler(TranscriptController.GetStudentTranscripts)
);

router.post(
  "/students/:studentId/generate",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ params: StudentIdParamSchema }),
  asyncHandler(TranscriptController.GenerateStudentTranscriptsForAllSemesters)
);

router.get(
  "/students/:studentId/semesters/:semesterId",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ params: StudentSemesterParamsSchema }),
  asyncHandler(TranscriptController.GetStudentSemesterTranscript)
);

export default router;
