import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import permissions from "../Utils/Permissions.json";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { ScheduleController } from "../Controllers/ScheduleController";
import { RequireSemesterHeader } from "../Middlewares/RequireSemesterHeader";
import { GetScheduleQuerySchema, SaveScheduleSchema } from "../Interfaces/ScheduleSlot/ScheduleSlotSchema";
import { EnrollInScheduleSchema } from "../Interfaces/Enrollment/EnrollInScheduleSchema";
import {
  AdminEnrollmentCreateSchema,
  AdminEnrollmentParamsSchema,
  AdminEnrollmentQuerySchema,
  AdminEnrollmentStudentParamsSchema,
  AdminEnrollmentUpdateSchema,
} from "../Interfaces/Enrollment/AdminEnrollmentSchema";

const router = Router();

router.get(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.program.read.name),
  RequireSemesterHeader, 
  ZodValidator({ query: GetScheduleQuerySchema}),
  asyncHandler(ScheduleController.GetSchedule)
);

router.put(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.update.name),
  RequireSemesterHeader,
  ZodValidator({ body: SaveScheduleSchema }),
  asyncHandler(ScheduleController.SaveSchedule)
);

router.get(
  "/admin/enrollments",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.read.name),
  ZodValidator({ query: AdminEnrollmentQuerySchema }),
  asyncHandler(ScheduleController.ListAdminEnrollments)
);

router.get(
  "/admin/enrollments/options",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.read.name),
  ZodValidator({ query: AdminEnrollmentQuerySchema }),
  asyncHandler(ScheduleController.GetAdminEnrollmentOptions)
);

router.get(
  "/admin/enrollments/students/:studentId",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.read.name),
  ZodValidator({
    params: AdminEnrollmentStudentParamsSchema,
    query: AdminEnrollmentQuerySchema,
  }),
  asyncHandler(ScheduleController.GetAdminStudentEnrollmentTrack)
);

router.post(
  "/admin/enrollments",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.update.name),
  ZodValidator({ body: AdminEnrollmentCreateSchema }),
  asyncHandler(ScheduleController.CreateAdminEnrollment)
);

router.patch(
  "/admin/enrollments/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.update.name),
  ZodValidator({
    params: AdminEnrollmentParamsSchema,
    body: AdminEnrollmentUpdateSchema,
  }),
  asyncHandler(ScheduleController.UpdateAdminEnrollment)
);

router.delete(
  "/admin/enrollments/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.delete.name),
  ZodValidator({ params: AdminEnrollmentParamsSchema }),
  asyncHandler(ScheduleController.DeleteAdminEnrollment)
);


// Enrollment is modeled as a sub-resource of Schedule (nested routes).
// Reason: An enrollment cannot exist without a schedule — it's a strong composition/ownership relationship.
// This makes the API more intuitive for operations like enrolling in a specific schedule.
// Naturally enforces that schedule must exist before creating an enrollment.

/**
 * Enrollment logic for self-registration:
 * - Student ID , Student Program Level ID , Student Program Id and Semester ID are taken from the authenticated JWT (not from request body).
 * - Students can only register for the current active semester (they cannot choose other semesters).
 * - The selected schedule slots are passed in the request body as an array.
 */
router.post(
  
  "/enroll",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.schedule.enroll.name),
  ZodValidator({ body: EnrollInScheduleSchema}),
  asyncHandler(ScheduleController.Enroll)
);


export default router;
