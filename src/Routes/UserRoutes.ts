import { Router } from "express";
import UserValidator from "../Validators/UserValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { UserController } from "../Controllers/UserController";
import { attachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
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
import StudentValidator from "../Validators/StudentValidator";
import { StudentController } from "../Controllers/StudentController";
import { HandleExcelUpload } from "../Middlewares/HandleExcelUpload";
import { ValidateExcelHeaders } from "../Validators/ValidateExcelHeaders";
import { StudentExcelHeaders } from "../Enums/StudentHeader";

const router: Router = Router({ mergeParams: true });

router.post(
  "/login",
  attachAndValidateTenant,
  ...UserValidator.Login(),
  ValidateRequest,
  asyncHandler(UserController.Login)
);

router.post(
  "/assign-root-account",
  IsAuthenticated,
  IsSuperAdmin,
  attachAndValidateTenant,
  ...SuperAdminValidator.AssignRootAccount(),
  ValidateRequest,
  asyncHandler(SuperAdminController.AssignRootAccount)
);

router.post(
  "/account/staff",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(permissions.account.create.name),
  ...UserValidator.CreateStaffAccount(),
  ValidateRequest,
  asyncHandler(UserController.CreateStaffAccount)
);

router.post(
    "/account/student",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(permissions.account.create.name),
    ...StudentValidator.Create(),
    ValidateRequest,
    asyncHandler(StudentController.Create)
)


router.post(
    "/account/student/import",
    IsAuthenticated,
    attachAndValidateTenant,
    RequirePermission(permissions.account.create.name),
    HandleExcelUpload,
    ValidateExcelHeaders(Object.values(StudentExcelHeaders)),
    ...StudentValidator.CreateBulk(),
    ValidateRequest,
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
  attachAndValidateTenant,
  RequirePermission(permissions.account.read.name),
  asyncHandler(UserController.GetAllStaffAccounts)
);

router.patch(
  "/account/staff/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(permissions.account.update.name),
  ...UserValidator.StaffIdParam(),
  ...UserValidator.UpdateStaffAccount(),
  ValidateRequest,
  asyncHandler(UserController.UpdateStaffAccount)
);

router.delete(
  "/account/staff/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(permissions.account.delete.name),
  ...UserValidator.StaffIdParam(),
  ValidateRequest,
  asyncHandler(UserController.DeleteStaffAccount)
);

router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;
