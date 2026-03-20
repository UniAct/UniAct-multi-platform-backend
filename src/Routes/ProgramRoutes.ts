import { Router } from "express";
import { attachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
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
    attachAndValidateTenant,
    RequirePermission(permissions.program.create.name),
    ...ProgramValidator.Create(),
    ValidateRequest,
    asyncHandler(ProgramController.CreateProgram)
)

router.get(
    "/",
    IsAuthenticated,
    attachAndValidateTenant,
    asyncHandler(ProgramController.GetAllPrograms)
)

router.get(
    "/:id",
    IsAuthenticated,
    attachAndValidateTenant,
    ...ProgramValidator.IdParam(),
    ValidateRequest,
    asyncHandler(ProgramController.GetProgramById)
)

router.put(
    "/:id",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(permissions.program.update.name),
    ...ProgramValidator.Update(),
    ValidateRequest,
    asyncHandler(ProgramController.UpdateProgram)
)

router.delete(
    "/:id",
    IsAuthenticated,
    attachAndValidateTenant,
    ...ProgramValidator.IdParam(),
    RequirePermission(permissions.program.delete.name),
    ValidateRequest,
    asyncHandler(ProgramController.Delete)
)

export default router;
