import { Router } from "express";
import { RBACValidator } from "../Validators/RBACValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { RBACController } from "../Controllers/RBACController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { attachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { AccountValidator } from "../Validators/AccountValidator";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { RBACRepository } from "../Repositories/RBACRepository";
import { asyncHandler } from "../Middlewares/ErrorHandler";

const router: Router = Router({mergeParams: true});

router.post(
  "/role",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Role.Create.Name),
  ...RBACValidator.CreateRole(),
  ValidateRequest,
  asyncHandler(RBACController.CreateRole)
);

router.get(
  "/role/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Role.Read.Name),
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  asyncHandler(RBACController.GetRole)
);

router.get(
  "/role",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Role.Read.Name),
  asyncHandler(RBACController.GetAllRole)
);

router.put(
  "/role/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Role.Update.Name),
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  asyncHandler(RBACController.UpdateRole)
);

router.delete(
  "/role/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Role.Delete.Name),
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  asyncHandler(RBACController.DeleteRole)
);

router.get(
  "/permission",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Role.Read.Name),
  asyncHandler(RBACController.ReadPermissions)
);

router.get(
  "/permission/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Role.Delete.Name),
  ...RBACValidator.ValidateIdParam(),
  ValidateRequest,
  asyncHandler(RBACController.ReadPermissionsById)
);

router.post(
  "/assign-permissions-to-role/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Role.Create.Name),
  ...RBACValidator.AssignPermissionsToRole(),
  ValidateRequest,
  asyncHandler(RBACController.AssignPermissionsToRole)
);

router.post(
  "/assign-role-to-user/:id",
  IsAuthenticated,
  attachAndValidateTenant,
  RequirePermission(RBACRepository.Account.AssignRole.Name),
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