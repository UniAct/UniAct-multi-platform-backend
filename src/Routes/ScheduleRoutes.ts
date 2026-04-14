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

const router = Router();

router.get(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.program.read.name),
  RequireSemesterHeader, 
  ZodValidator({ query: GetScheduleQuerySchema }),
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

export default router;
