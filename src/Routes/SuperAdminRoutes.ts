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
  asyncHandler(SuperAdminController.ActivateRootAccount)
 )

router.post(
  "/login",

  ...SuperAdminValidator.Login(),
  ValidateRequest,
  asyncHandler(SuperAdminController.Login)
);

router.get("/", IsAuthenticated, IsSuperAdmin, asyncHandler(SuperAdminController.GetAll));

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