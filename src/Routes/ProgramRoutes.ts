import { Router } from "express";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import ProgramController from "../Controllers/ProgramController";
import ProgramValidator from "../Validators/ProgramValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import permissions from "../Utils/Permissions.json";

const router = Router();


router.post(
    "/create",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.program.create.name),
    ...ProgramValidator.Create(),
    ValidateRequest,
    asyncHandler(ProgramController.CreateProgram)
)

router.get(
    "/",
    IsAuthenticated,
    AttachAndValidateTenant,
    asyncHandler(ProgramController.GetAllPrograms)
)

router.get(
    "/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    ...ProgramValidator.IdParam(),
    ValidateRequest,
    asyncHandler(ProgramController.GetProgramById)
)

router.put(
    "/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.program.update.name),
    ...ProgramValidator.Update(),
    ValidateRequest,
    asyncHandler(ProgramController.UpdateProgram)
)

router.delete(
    "/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    ...ProgramValidator.IdParam(),
    RequirePermission(permissions.program.delete.name),
    ValidateRequest,
    asyncHandler(ProgramController.Delete)
)

export default router;
