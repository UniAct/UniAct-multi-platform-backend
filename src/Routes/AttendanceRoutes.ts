import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { AttendanceController } from "../Controllers/AttendanceController";
import {
  CreateAttendanceSessionSchema,
  ScanAttendanceSchema,
  StudentAttendanceStatusQuerySchema,
  UpsertAttendancesSchema,
} from "../Interfaces/Attendance/AttendanceSchema";

const router = Router();

router.get(
  "/course-summaries",
  IsAuthenticated,
  AttachAndValidateTenant,
  asyncHandler(AttendanceController.GetCourseSummaries),
);

router.get(
  "/courses",
  IsAuthenticated,
  AttachAndValidateTenant,
  asyncHandler(AttendanceController.GetCourseOptions),
);

router.post(
  "/session",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ body: CreateAttendanceSessionSchema }),
  asyncHandler(AttendanceController.CreateSession),
);

router.get(
  "/session/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  asyncHandler(AttendanceController.GetSession),
);

router.get(
  "/session/by-slot/:scheduleSlotId",
  IsAuthenticated,
  AttachAndValidateTenant,
  asyncHandler(AttendanceController.GetSessionBySlotAndDate),
);

router.get(
  "/enrolled/:slotContextId",
  IsAuthenticated,
  AttachAndValidateTenant,
  asyncHandler(AttendanceController.GetEnrolledStudents),
);

router.get(
  "/enrolled/course/:courseId",
  IsAuthenticated,
  AttachAndValidateTenant,
  asyncHandler(AttendanceController.GetEnrolledStudentsByCourse),
);

router.post(
  "/session/:id/attendances",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ body: UpsertAttendancesSchema }),
  asyncHandler(AttendanceController.UpsertAttendances),
);

router.get(
  "/mobile/dashboard",
  IsAuthenticated,
  AttachAndValidateTenant,
  asyncHandler(AttendanceController.GetMobileDashboard),
);

router.get(
  "/mobile/student/my-status",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ query: StudentAttendanceStatusQuerySchema }),
  asyncHandler(AttendanceController.GetStudentAttendanceStatus),
);

router.post(
  "/session/:id/scan",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ body: ScanAttendanceSchema }),
  asyncHandler(AttendanceController.ScanAttendance),
);

export default router;
