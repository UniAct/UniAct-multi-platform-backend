import { Router } from "express";
import { SemesterController } from "../Controllers/SemesterController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import  SemesterValidator  from "../Validators/SemesterValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { attachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import permissions from "../Utils/Permissions.json";

const router = Router();

router.post(
    "/",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(permissions.semester.create.name),
    ...SemesterValidator.Create(),
    ValidateRequest,
    asyncHandler(SemesterController.CreateSemester)
);

router.get(
    "/",
    IsAuthenticated,
    RequirePermission(permissions.semester.read.name),
    attachAndValidateTenant,
    asyncHandler(SemesterController.GetAllSemesters)
);

router.get(
    "/:id",
    IsAuthenticated,
    RequirePermission(permissions.semester.read.name),
    attachAndValidateTenant,
    ...SemesterValidator.IdParam(),
    ValidateRequest,
    asyncHandler(SemesterController.GetSemesterById)
);

router.put(
    "/:id",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(permissions.semester.update.name),
    ...SemesterValidator.Update(),
    ValidateRequest,
    asyncHandler(SemesterController.UpdateSemester)
);

router.delete(
    "/:id",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(permissions.semester.delete.name),
    ...SemesterValidator.IdParam(),
    ValidateRequest,
    asyncHandler(SemesterController.DeleteSemester)
);

export default router;