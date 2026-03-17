import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { TenantResolver } from "../Middlewares/TenantResolver";
import { TenantResolverAfterAuthentication } from "../Middlewares/TenantResolverAfterAuthentication";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { CourseController } from "../Controllers/CourseController";
import CourseValidator from "../Validators/CourseValidator";

const router = Router();

router.post(
  "/",
  IsAuthenticated,
  TenantResolverAfterAuthentication,
  ...CourseValidator.Create(),
  ValidateRequest,
  asyncHandler(CourseController.CreateCourse),
);

router.get(
  "/",
  TenantResolver,
  IsAuthenticated,
  asyncHandler(CourseController.GetAllCourses),
);

router.get(
  "/:id",
  TenantResolver,
  IsAuthenticated,
  ...CourseValidator.IdParam(),
  ValidateRequest,
  asyncHandler(CourseController.GetCourseById),
);

router.put(
  "/:id",
  IsAuthenticated,
  TenantResolverAfterAuthentication,
  ...CourseValidator.Update(),
  ValidateRequest,
  asyncHandler(CourseController.UpdateCourse),
);

router.delete(
  "/:id",
  IsAuthenticated,
  TenantResolverAfterAuthentication,
  ...CourseValidator.IdParam(),
  ValidateRequest,
  asyncHandler(CourseController.DeleteCourse),
);

export default router;
