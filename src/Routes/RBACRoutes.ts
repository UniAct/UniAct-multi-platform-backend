import { Router } from "express";
import { RBACValidator } from "../Validators/RBACValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RBACController } from "../Controllers/RBACController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { AccountValidator } from "../Validators/AccountValidator";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import permissions from "../Utils/Permissions.json";

const router: Router = Router({mergeParams: true});

router.post(
  "/role",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.role.create.name),
  ...RBACValidator.CreateRole(),
  ValidateRequest,
  asyncHandler(RBACController.CreateRole)
);

router.get(
  "/role/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.role.read.name),
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  asyncHandler(RBACController.GetRole)
);

router.get(
  "/role",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.role.read.name),
  asyncHandler(RBACController.GetAllRole)
);

router.put(
  "/role/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.role.update.name),
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  asyncHandler(RBACController.UpdateRole)
);

router.delete(
  "/role/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.role.delete.name),
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  asyncHandler(RBACController.DeleteRole)
);

router.get(
  "/permission",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.role.read.name),
  asyncHandler(RBACController.ReadPermissions)
);

router.get(
  "/permission/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.role.delete.name),
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  asyncHandler(RBACController.ReadPermissionsById)
);

router.post(
  "/assign-permissions-to-role/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.role.create.name),
  ...RBACValidator.AssignPermissionsToRole(),
  ValidateRequest,
  asyncHandler(RBACController.AssignPermissionsToRole)
);

router.post(
  "/assign-role-to-user/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.account.assign_role.name),
  ...AccountValidator.AssignRoleToUser(),
  ValidateRequest,
  asyncHandler(RBACController.AssignRoleToUser)
);

router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;