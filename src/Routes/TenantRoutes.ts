import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import TenantValidator from "../Validators/TenantValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import TenantController from "../Controllers/TenantController";

const router : Router = Router();

router.post(
  "/create",
  IsAuthenticated,
  IsSuperAdmin,
  ...TenantValidator.Create(),
  ValidateRequest,
  TenantController.Create
);

router.get(
  "/",
  IsAuthenticated,
  IsSuperAdmin,
  TenantController.GetAll
);

router.get(
  "/:id",
  IsAuthenticated,
  IsSuperAdmin,
  ...TenantValidator.IdParam(),
  ValidateRequest,
  TenantController.GetById
);

router.delete(
  "/:id",
  IsAuthenticated,
  IsSuperAdmin,
  ...TenantValidator.IdParam(),
  ValidateRequest,
  TenantController.Delete
);

export default router;
