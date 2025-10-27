import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import TenantValidator from "../Validators/TenantValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import TenantController from "../Controllers/TenantController";
import SuperAdminValidator from "../Validators/SuperAdminValidator";
import SuperAdminController from "../Controllers/SuperAdminController";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";

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

router.all(/.*/, (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { route: "Route not found" }
    });
});

export default router;
