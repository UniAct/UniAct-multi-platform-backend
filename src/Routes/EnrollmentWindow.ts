import { Router } from "express";


import { ZodValidator } from "../Middlewares/ZodValidation";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { createEnrollmentWindowSchema, idParamSchema, updateEnrollmentWindowSchema } from "../Interfaces/Enrollment-Window/EnrollmentWindow";
import { FacultyIdParamSchema } from "../Interfaces/Faculty/FacultySchema";
import { EnrollmentWindowController } from "../Controllers/EnrollmentWindow";

const router = Router();

// 1. Create an Enrollment Window (Admin)
router.post(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
//   RequirePermission(permissions.enrollmentWindow.create.name),
  ZodValidator({ body: createEnrollmentWindowSchema }),
  ValidateRequest,
  asyncHandler(EnrollmentWindowController.CreateEnrollmentWindow),
);

// 2. Update an Enrollment Window (Admin)
// Leveraging your multi-location map to validate both the URL param and the update body at once
router.put(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
//   RequirePermission(permissions.enrollmentWindow.update.name),
  ZodValidator({ 
    params: idParamSchema, 
    body: updateEnrollmentWindowSchema 
  }),
  ValidateRequest,
  asyncHandler(EnrollmentWindowController.UpdateEnrollmentWindow),
);



export default router;