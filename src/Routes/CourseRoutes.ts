import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { attachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { CourseController } from "../Controllers/CourseController";
import CourseValidator from "../Validators/CourseValidator";
import permissions from "../Utils/Permissions.json";

const router = Router();

router.post(
  "/",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(permissions.course.create.name),
  ...CourseValidator.Create(),
  ValidateRequest,
  asyncHandler(CourseController.CreateCourse),
);

router.get(
  "/",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(permissions.course.read.name),
  asyncHandler(CourseController.GetAllCourses),
);

router.get(
  "/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(permissions.course.read.name),
  ...CourseValidator.IdParam(),
  ValidateRequest,
  asyncHandler(CourseController.GetCourseById),
);

router.put(
  "/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(permissions.course.update.name),
  ...CourseValidator.Update(),
  ValidateRequest,
  asyncHandler(CourseController.UpdateCourse),
);

router.delete(
  "/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(permissions.course.delete.name),
  ...CourseValidator.IdParam(),
  ValidateRequest,
  asyncHandler(CourseController.DeleteCourse),
);

export default router;
