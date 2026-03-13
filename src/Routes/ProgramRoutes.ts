import { Router } from "express";
import { TenantResolver } from "../Middlewares/TenantResolver";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import ProgramController from "../Controllers/ProgramController";
import ProgramValidator from "../Validators/ProgramValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { RBACRepository } from "../Repositories/RBACRepository";
import { asyncHandler } from "../Middlewares/ErrorHandler";
const router = Router();


router.post(
    "/create",
    TenantResolver,
    IsAuthenticated,
    RequirePermission(RBACRepository.Program.Create.Name),
    ...ProgramValidator.Create(),
    ValidateRequest,
    asyncHandler(ProgramController.CreateProgram)
)

router.get(
    "/",
    TenantResolver,
    IsAuthenticated,
    asyncHandler(ProgramController.GetAllPrograms)
)

router.delete(
    "/:id",
    IsAuthenticated,
    RequirePermission(RBACRepository.Program.Delete.Name),
    ...ProgramValidator.IdParam(),
    ValidateRequest,
    asyncHandler(ProgramController.Delete)
)

export default router;