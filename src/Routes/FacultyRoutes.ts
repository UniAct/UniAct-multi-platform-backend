import { Router } from "express";
import { FacultyController } from "../Controllers/FacultyController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import FacultyValidator from "../Validators/FacultyVaildator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { RBACRepository } from "../Repositories/RBACRepository";
import { TenantResolver } from "../Middlewares/TenantResolver";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { TenantResolverAfterAuthentication } from "../Middlewares/TenantResolverAfterAuthentication";

const router = Router();
//Create Faculty
router.post(
    "/",
    IsAuthenticated,
    TenantResolverAfterAuthentication,
    RequirePermission(RBACRepository.Faculty.Create.Name),

    //Request validation
    ...FacultyValidator.Create(),
    ValidateRequest,
    //
     asyncHandler(FacultyController.CreateFaculty)
);

//Get All Faculties
router.get("/",TenantResolver, FacultyController.GetAllFaculties),

//Get Faculty By Id
router.get("/:id",
    TenantResolver,
    ...FacultyValidator.IdParam(),
    ValidateRequest,
    asyncHandler(FacultyController.GetFacultyById)
);

//Delete a faculty
router.delete("/:id",
    IsAuthenticated,
    TenantResolverAfterAuthentication,
    RequirePermission(RBACRepository.Faculty.Delete.Name),
    ...FacultyValidator.IdParam(),
    ValidateRequest,
    asyncHandler(FacultyController.DeleteFaculty )
);

export default router;