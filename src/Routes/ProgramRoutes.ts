import { Router } from "express";
import { attachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import ProgramController from "../Controllers/ProgramController";
import ProgramValidator from "../Validators/ProgramValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { RBACRepository } from "../Repositories/RBACRepository";
import { asyncHandler } from "../Middlewares/ErrorHandler";

const router = Router();


router.post(
    "/create",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(RBACRepository.Program.Create.Name),
    ...ProgramValidator.Create(),
    ValidateRequest,
    asyncHandler(ProgramController.CreateProgram)
)

router.get(
    "/",
    attachAndValidateTenant,
    IsAuthenticated,
    asyncHandler(ProgramController.GetAllPrograms)
)

router.delete(
    "/:id",
    IsAuthenticated,
    attachAndValidateTenant,
    ...ProgramValidator.IdParam(),
    RequirePermission(RBACRepository.Program.Delete.Name),
    ValidateRequest,
    asyncHandler(ProgramController.Delete)
)

export default router;