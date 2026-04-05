import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { ClassroomController } from "../Controllers/ClassroomController";
import ClassroomValidator from "../Validators/ClassroomValidator";
import permissions from "../Utils/Permissions.json";

const router = Router();

router.post(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.classroom.create.name),
  ...ClassroomValidator.Create(),
  ValidateRequest,
  asyncHandler(ClassroomController.CreateClassroom),
);

router.get(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.classroom.read.name),
  asyncHandler(ClassroomController.GetAllClassrooms),
);

router.get(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.classroom.read.name),
  ...ClassroomValidator.IdParam(),
  ValidateRequest,
  asyncHandler(ClassroomController.GetClassroomById),
);

router.put(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.classroom.update.name),
  ...ClassroomValidator.Update(),
  ValidateRequest,
  asyncHandler(ClassroomController.UpdateClassroom),
);

router.delete(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.classroom.delete.name),
  ...ClassroomValidator.IdParam(),
  ValidateRequest,
  asyncHandler(ClassroomController.DeleteClassroom),
);

export default router;