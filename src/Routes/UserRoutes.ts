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

const router: Router = Router({mergeParams: true});

router.post(
  "/login",
  TenantResolver,       
  ...UserValidator.Login(),
  ValidateRequest,      
  UserController.Login  
);

router.post(
  "/assign-root-account",
  TenantResolver,
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.AssignRootAccount(),
  ValidateRequest,
  SuperAdminController.AssignRootAccount
);

//! send email for verification
router.post(
  "/account/staff",
  TenantResolver,
  IsAuthenticated,
  RequirePermission(RBACRepository.Account.Create.Name),
  ...UserValidator.CreateStaffAccount(),
  ValidateRequest,
  UserController.CreateStaffAccount
);

//! TODO: Delete, Update, Read account for Student Account And Staff Account
router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;