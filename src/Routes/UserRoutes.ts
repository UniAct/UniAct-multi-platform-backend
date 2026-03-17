import { Router } from "express";
import UserValidator from "../Validators/UserValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { UserController } from "../Controllers/UserController";
import { TenantResolver } from "../Middlewares/TenantResolver";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import SuperAdminValidator from "../Validators/SuperAdminValidator";
import SuperAdminController from "../Controllers/SuperAdminController";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { RBACRepository } from "../Repositories/RBACRepository";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { TenantResolverAfterAuthentication } from "../Middlewares/TenantResolverAfterAuthentication";
import { ExtractTenantField } from "../Middlewares/ExtractTenantField";
import { ValidateToken } from "../Middlewares/ValidationToken";

const router: Router = Router({ mergeParams: true });

router.post(
  "/login",
  TenantResolver,
  ...UserValidator.Login(),
  ValidateRequest,
  asyncHandler(UserController.Login)
);

router.post(
  "/assign-root-account",
  ExtractTenantField,
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.AssignRootAccount(),
  ValidateRequest,
  asyncHandler(SuperAdminController.AssignRootAccount)
);

//! send email for verification
router.post(
  "/account/staff",
  IsAuthenticated,
  TenantResolverAfterAuthentication,
  RequirePermission(RBACRepository.Account.Create.Name),
  ...UserValidator.CreateStaffAccount(),
  ValidateRequest,
  asyncHandler(UserController.CreateStaffAccount)
);

router.get(
  "/verify-staff-account/:token",
  ValidateToken,
  asyncHandler(UserController.ActivateStaffAccount)
);

router.get(
  "/account/staff",
  IsAuthenticated,
  TenantResolverAfterAuthentication,
  RequirePermission(RBACRepository.Account.Read.Name),
  asyncHandler(UserController.GetAllStaffAccounts)
);

router.patch(
  "/account/staff/:id",
  IsAuthenticated,
  TenantResolverAfterAuthentication,
  RequirePermission(RBACRepository.Account.Update.Name),
  ...UserValidator.StaffIdParam(),
  ...UserValidator.UpdateStaffAccount(),
  ValidateRequest,
  asyncHandler(UserController.UpdateStaffAccount)
);

router.delete(
  "/account/staff/:id",
  IsAuthenticated,
  TenantResolverAfterAuthentication,
  RequirePermission(RBACRepository.Account.Delete.Name),
  ...UserValidator.StaffIdParam(),
  ValidateRequest,
  asyncHandler(UserController.DeleteStaffAccount)
);

//! TODO: Delete, Update, Read account for Student Account And Staff Account
router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;
