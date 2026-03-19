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
import { RBACRepository } from "../Repositories/RBACRepository";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { ValidateToken } from "../Middlewares/ValidationToken";

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

//! send email for verification
router.post(
  "/account/staff",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Account.Create.Name),
  ...UserValidator.CreateStaffAccount(),
  ValidateRequest,
  asyncHandler(UserController.CreateStaffAccount)
);

router.get(
  "/verify-staff-account/:token",
  ValidateToken,
  attachAndValidateTenant,
  asyncHandler(UserController.ActivateStaffAccount)
);

router.get(
  "/account/staff",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Account.Read.Name),
  asyncHandler(UserController.GetAllStaffAccounts)
);

router.patch(
  "/account/staff/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Account.Update.Name),
  ...UserValidator.StaffIdParam(),
  ...UserValidator.UpdateStaffAccount(),
  ValidateRequest,
  asyncHandler(UserController.UpdateStaffAccount)
);

router.delete(
  "/account/staff/:id",
  IsAuthenticated,
  attachAndValidateTenant,
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
