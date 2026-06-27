import { Router } from "express";
import { FacultyController } from "../Controllers/FacultyController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import FacultyValidator from "../Validators/FacultyVaildator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import permissions from "../Utils/Permissions.json";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { CreateFacultyBodySchema } from "../Interfaces/Faculty/FacultySchema";

const router = Router();

router.get("/public/:schema/faculties", asyncHandler(FacultyController.GetPublicFaculties));

// --- Create Faculty ---
router.post(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.faculty.create.name),
  ZodValidator({ body: CreateFacultyBodySchema }),
  asyncHandler(FacultyController.CreateFaculty)
);

//Get All Faculties
router.get("/", AttachAndValidateTenant, FacultyController.GetAllFaculties),

//Get Faculty By Id
router.get("/:id",
    AttachAndValidateTenant,
    ...FacultyValidator.IdParam(),
    ValidateRequest,
    asyncHandler(FacultyController.GetFacultyById)
);

//get all programs for this faculty
router.get("/:id/programs",
    AttachAndValidateTenant,
    ...FacultyValidator.IdParam(),
    ValidateRequest,
    asyncHandler(FacultyController.GetProgramsByFacultyID)
)

// Update Faculty by Id
router.put(
    "/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.faculty.update.name),
    ...FacultyValidator.Update(),
    ValidateRequest,
    asyncHandler(FacultyController.UpdateFaculty)
);

//Delete a faculty
router.delete("/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.faculty.delete.name),
    ...FacultyValidator.IdParam(),
    ValidateRequest,
    asyncHandler(FacultyController.DeleteFaculty)
);

export default router;
