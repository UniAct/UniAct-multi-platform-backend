import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { CourseController } from "../Controllers/CourseController";
import permissions from "../Utils/Permissions.json";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { CourseParamSchema, CreateCourseSchema, UpdateCourseSchema } from "../Validators/CourseValidator";

const router = Router();

router.post(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.create.name),
  ZodValidator({body:CreateCourseSchema}),
  ValidateRequest,
  asyncHandler(CourseController.CreateCourse),
);

router.get(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.read.name),
  asyncHandler(CourseController.GetAllCourses),
);

router.get(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.read.name),
  ZodValidator({params:CourseParamSchema}),
  asyncHandler(CourseController.GetCourseById),
);

router.put(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.update.name),
  ZodValidator({params: CourseParamSchema}),
  ZodValidator({body:UpdateCourseSchema}),
  asyncHandler(CourseController.UpdateCourse),
);

router.delete(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.delete.name),
  ZodValidator({params: CourseParamSchema}),
  asyncHandler(CourseController.DeleteCourse),
);

export default router;
