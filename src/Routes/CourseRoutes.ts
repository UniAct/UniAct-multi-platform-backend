import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { attachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { CourseController } from "../Controllers/CourseController";
import { RBACRepository } from "../Repositories/RBACRepository";
import CourseValidator from "../Validators/CourseValidator";

const router = Router();

router.post(
  "/",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Course.Create.Name),
  ...CourseValidator.Create(),
  ValidateRequest,
  asyncHandler(CourseController.CreateCourse),
);

router.get(
  "/",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Course.Read.Name),
  asyncHandler(CourseController.GetAllCourses),
);

router.get(
  "/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Course.Read.Name),
  ...CourseValidator.IdParam(),
  ValidateRequest,
  asyncHandler(CourseController.GetCourseById),
);

router.put(
  "/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Course.Update.Name),
  ...CourseValidator.Update(),
  ValidateRequest,
  asyncHandler(CourseController.UpdateCourse),
);

router.delete(
  "/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Course.Delete.Name),
  ...CourseValidator.IdParam(),
  ValidateRequest,
  asyncHandler(CourseController.DeleteCourse),
);

export default router;
