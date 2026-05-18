import { Router } from "express";
import { SemesterController } from "../Controllers/SemesterController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import  SemesterValidator  from "../Validators/SemesterValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import permissions from "../Utils/Permissions.json";

const router = Router();

router.post(
    "/",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.semester.create.name),
    ...SemesterValidator.Create(),
    ValidateRequest,
    asyncHandler(SemesterController.CreateSemester)
);

router.get(
    "/",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.semester.read.name),
    asyncHandler(SemesterController.GetAllSemesters)
);

router.get(
    "/current",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.semester.read.name),
    asyncHandler(SemesterController.GetCurrentSemester)
);

router.get(
    "/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.semester.read.name),
    ...SemesterValidator.IdParam(),
    ValidateRequest,
    asyncHandler(SemesterController.GetSemesterById)
);


router.put(
    "/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.semester.update.name),
    ...SemesterValidator.Update(),
    ValidateRequest,
    asyncHandler(SemesterController.UpdateSemester)
);

router.delete(
    "/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.semester.delete.name),
    ...SemesterValidator.IdParam(),
    ValidateRequest,
    asyncHandler(SemesterController.DeleteSemester)
);

export default router;
