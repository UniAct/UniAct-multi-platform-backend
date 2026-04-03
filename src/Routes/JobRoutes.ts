import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import permissions from "../Utils/Permissions.json";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { JobController } from "../Controllers/JobController";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { JobIdParamSchema } from "../Interfaces/Jobs/GetStudentImportStatus/JobIdParam";


const router = Router();

router.get(
    "/student-import/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.account.read.name),
    ZodValidator([
      [JobIdParamSchema , "params"]
    ]),
    asyncHandler(JobController.CheckStudentImportStatus)
);


export default router;
