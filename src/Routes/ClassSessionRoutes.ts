import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import permissions from "../Utils/Permissions.json";
import { ZodValidator } from "../Middlewares/ZodValidation";
import {
  ClassSessionLevelQuerySchema,
  SaveClassSessionLevelBodySchema,
} from "../Interfaces/ClassSession/ClassSessionSchema";
import { ClassSessionController } from "../Controllers/ClassSessionController";
import { RequireSemesterHeader } from "../Middlewares/RequireSemesterHeader";

const router = Router();

router.get(
  "/level",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.read.name),
  asyncHandler(RequireSemesterHeader),
  ZodValidator([[ClassSessionLevelQuerySchema, "query"]]),
  asyncHandler(ClassSessionController.GetLevelTimetable),
);

router.put(
  "/level",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.update.name),
  asyncHandler(RequireSemesterHeader),
  ZodValidator([[SaveClassSessionLevelBodySchema, "body"]]),
  asyncHandler(ClassSessionController.SaveLevelTimetable),
);

export default router;
