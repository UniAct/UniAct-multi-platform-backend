import { Router } from "express";
import { attachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import ProgramController from "../Controllers/ProgramController";
import ProgramValidator from "../Validators/ProgramValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { RBACRepository } from "../Repositories/RBACRepository";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { TenantResolverAfterAuthentication } from "../Middlewares/TenantResolverAfterAuthentication";

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
    TenantResolverAfterAuthentication,
    RequirePermission(RBACRepository.Program.Update.Name),
    ...ProgramValidator.Update(),
    ValidateRequest,
    asyncHandler(ProgramController.UpdateProgram)
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
