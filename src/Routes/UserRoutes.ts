import { Router } from "express";
import UserValidator from "../Validators/UserValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { UserController } from "../Controllers/UserController";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import SuperAdminValidator from "../Validators/SuperAdminValidator";
import SuperAdminController from "../Controllers/SuperAdminController";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { ValidateToken } from "../Middlewares/ValidationToken";
import permissions from "../Utils/Permissions.json";
import { StudentController } from "../Controllers/StudentController";
import { HandleExcelUpload } from "../Middlewares/HandleExcelUpload";
import { ValidateExcelHeaders } from "../Validators/ValidateExcelHeaders";
import { StudentExcelHeaders } from "../Enums/StudentHeader";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { StudentIdParamSchema, UpdateStudentBodySchema } from "../Interfaces/Student/UpdateStudent/UpdateSchema";
import { CreateStudentSchema } from "../Interfaces/Student/CreateStudent/CreateSchema";
import { CreateBulkStudentSchema } from "../Interfaces/Student/CreateStudent/CreateBulkSchema";
import { StudentQuerySchema } from "../Interfaces/Student/GetStudentPage/QuerySchema";

const router: Router = Router({ mergeParams: true });

router.post(
  "/login",
  AttachAndValidateTenant,
  ...UserValidator.Login(),
  ValidateRequest,
  asyncHandler(UserController.Login)
);

router.post(
  "/assign-root-account",
  IsAuthenticated,
  IsSuperAdmin,
  AttachAndValidateTenant,
  ...SuperAdminValidator.AssignRootAccount(),
  ValidateRequest,
  asyncHandler(SuperAdminController.AssignRootAccount)
);

router.post(
  "/account/staff",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.account.create.name),
  ...UserValidator.CreateStaffAccount(),
  ValidateRequest,
  asyncHandler(UserController.CreateStaffAccount)
);

router.post(
    "/account/student",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.account.create.name),
    ZodValidator({
      body:CreateStudentSchema
    }),
    asyncHandler(StudentController.Create)
)

//! don't forget to remove the created at from and to
router.get(
    "/account/student",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.account.read.name),
    ZodValidator(
      {query:StudentQuerySchema}
    ),
    asyncHandler(StudentController.GetAll)
)

router.patch(
    "/account/student/:id",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.account.update.name),
    ZodValidator(
      {
        params:StudentIdParamSchema,
        body: UpdateStudentBodySchema,
      }
    ),
    asyncHandler(StudentController.Update)
)


router.patch(
    "/account/student/:id/activate",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.account.update.name),
    ZodValidator(
      {
        params:StudentIdParamSchema
      }
    ),
    asyncHandler(StudentController.Activate)
)


router.post(
    "/account/student/import",
    IsAuthenticated,
    AttachAndValidateTenant,
    RequirePermission(permissions.account.create.name),
    HandleExcelUpload,
    ValidateExcelHeaders(Object.values(StudentExcelHeaders)),
    ZodValidator(
      {body:CreateBulkStudentSchema}
    ),
    asyncHandler(StudentController.CreateBulk)
)

router.get(
  "/verify-staff-account/:token",
  ValidateToken,
  asyncHandler(UserController.ActivateStaffAccount)
);

router.get(
  "/account/staff",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.account.read.name),
  asyncHandler(UserController.GetAllStaffAccounts)
);

router.patch(
  "/account/staff/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.account.update.name),
  ...UserValidator.IdParam("Staff"),
  ...UserValidator.UpdateStaffAccount(),
  ValidateRequest,
  asyncHandler(UserController.UpdateStaffAccount)
);

router.delete(
  "/account/staff/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.account.delete.name),
  ...UserValidator.IdParam("Staff"),
  ValidateRequest,
  asyncHandler(UserController.DeleteStaffAccount)
);

router.delete(
  "/account/student/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.account.delete.name),
  ZodValidator(
    {params:StudentIdParamSchema}
  ),
  asyncHandler(StudentController.Delete)
);

router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;
