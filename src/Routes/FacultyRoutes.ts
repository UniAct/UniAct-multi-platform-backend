import { Router } from "express";
import { FacultyController } from "../Controllers/FacultyController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import FacultyValidator from "../Validators/FacultyVaildator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { attachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import permissions from "../Utils/Permissions.json";

const router = Router();
//Create Faculty
router.post(
    "/",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(permissions.faculty.create.name),

    //Request validation
    ...FacultyValidator.Create(),
    ValidateRequest,
    //
    asyncHandler(FacultyController.CreateFaculty)
);

//Get All Faculties
router.get("/", attachAndValidateTenant, FacultyController.GetAllFaculties),

    //Get Faculty By Id
    router.get("/:id",
        attachAndValidateTenant,
        ...FacultyValidator.IdParam(),
        ValidateRequest,
        asyncHandler(FacultyController.GetFacultyById)
    );

// Update Faculty by Id
router.put(
    "/:id",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(permissions.faculty.update.name),
    ...FacultyValidator.Update(),
    ValidateRequest,
    asyncHandler(FacultyController.UpdateFaculty)
);

//Delete a faculty
router.delete("/:id",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(permissions.faculty.delete.name),
    ...FacultyValidator.IdParam(),
    ValidateRequest,
    asyncHandler(FacultyController.DeleteFaculty)
);

export default router;
