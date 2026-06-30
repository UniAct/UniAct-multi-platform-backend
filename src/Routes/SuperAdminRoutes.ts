import { Router } from "express";
import SuperAdminController from "../Controllers/SuperAdminController";
import SuperAdminValidator from "../Validators/SuperAdminValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import { ValidateToken } from "../Middlewares/ValidationToken";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";

const router: Router = Router();

router.post(
  "/register",
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.CreateSuperAdmin(),
  ValidateRequest,
  asyncHandler(SuperAdminController.Register)
);

router.get("/verify/:token",  ValidateToken , asyncHandler( SuperAdminController.Activate));

router.get(
  "/verify-root-account/:token",
  ValidateToken,
  AttachAndValidateTenant,
  asyncHandler(SuperAdminController.ActivateRootAccount)
 )

router.post(
  "/login",
  
  ...SuperAdminValidator.Login(),
  ValidateRequest,
  asyncHandler(SuperAdminController.Login)
);

router.get("/", IsAuthenticated, IsSuperAdmin, asyncHandler(SuperAdminController.GetAll));

router.get(
  "/tenants/:schema/root-admins",
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.TenantSchemaParam(),
  ValidateRequest,
  asyncHandler(SuperAdminController.GetTenantRootAdmins)
);

router.patch(
  "/tenants/:schema/root-admins/:userId/status",
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.RootAdminParams(),
  ...SuperAdminValidator.RootAdminStatus(),
  ValidateRequest,
  asyncHandler(SuperAdminController.UpdateTenantRootAdminStatus)
);

router.patch(
  "/tenants/:schema/root-admins/:userId/password",
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.RootAdminParams(),
  ...SuperAdminValidator.RootAdminPassword(),
  ValidateRequest,
  asyncHandler(SuperAdminController.ResetTenantRootAdminPassword)
);

router.post(
  "/tenants/:schema/root-admins/:userId/resend-verification",
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.RootAdminParams(),
  ValidateRequest,
  asyncHandler(SuperAdminController.ResendTenantRootAdminVerification)
);

router.delete(
  "/:username",
  
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.UsernameParam(),
  ValidateRequest,
  asyncHandler(SuperAdminController.Delete)
);



router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;
