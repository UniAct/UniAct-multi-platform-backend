import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { ClassroomController } from "../Controllers/ClassroomController";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { ClassroomIdParamSchema, ClassroomUpsertSchema } from "../Interfaces/Classroom/ClassroomSchema";
import permissions from "../Utils/Permissions.json";

const router = Router();

router.post(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.classroom.create.name),
  ZodValidator([[ClassroomUpsertSchema, "body"]]),
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
  ZodValidator([[ClassroomIdParamSchema, "params"]]),
  asyncHandler(ClassroomController.GetClassroomById),
);

router.put(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.classroom.update.name),
  ZodValidator([
    [ClassroomIdParamSchema, "params"],
    [ClassroomUpsertSchema, "body"],
  ]),
  asyncHandler(ClassroomController.UpdateClassroom),
);

router.delete(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.classroom.delete.name),
  ZodValidator([[ClassroomIdParamSchema, "params"]]),
  asyncHandler(ClassroomController.DeleteClassroom),
);

export default router;
