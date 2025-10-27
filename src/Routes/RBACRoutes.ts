import { Router } from "express";
import { RBACValidator } from "../Validators/RBACValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RBACController } from "../Controllers/RBACController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { RBACAuthorization } from "../Middlewares/Authorization/RBACAuthorization";
import { TenantResolver } from "../Middlewares/TenantResolver";
import { AccountValidator } from "../Validators/AccountValidator";
import { AccountAuthorization } from "../Middlewares/Authorization/AccountAuthorization";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";
const router : Router = Router();

router.post(
  "/role",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasCreatePermission,
  ...RBACValidator.CreateRole(),
  ValidateRequest,
  RBACController.CreateRole
);

router.get(
  "/role/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasReadPermission,
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  RBACController.GetRole
);

router.get(
  "/role",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasReadPermission,
  RBACController.GetAllRole
);

router.put(
  "/role/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasUpdatePermission,
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  RBACController.UpdateRole
);

router.delete(
  "/role/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasDeletePermission,
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  RBACController.DeleteRole
);

router.get(
  "/permission",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasReadPermission,
  RBACController.ReadPermissions
);

router.get(
  "/permission/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasDeletePermission,
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  RBACController.ReadPermissionsById
);

router.post(
  "/assign-permissions-to-role/:id",
  TenantResolver,
  IsAuthenticated,
  RBACAuthorization.HasCreatePermission,
  ...RBACValidator.AssignPermissionsToRole(),
  ValidateRequest,
  RBACController.AssignPermissionsToRole
);

router.post(
  "/assign-role-to-user/:id",
  TenantResolver,
  IsAuthenticated,
  AccountAuthorization.HasAssignRolePermission,
  ...AccountValidator.AssignRoleToUser(),
  ValidateRequest,
  RBACController.AssignRoleToUser
);

router.all(/.*/, (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { route: "Route not found" }
    });
});

export default router;