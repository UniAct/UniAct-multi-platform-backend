import { Router } from "express";
import SuperAdminController from "../Controllers/SuperAdminController";
import SuperAdminValidator from "../Validators/SuperAdminValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import { ValidateToken } from "../Middlewares/ValidationToken";

const router : Router = Router();

/**
 * Routes under this section implement Discretionary Access Control (DAC)
 * through the SuperAdmin role. Only users with the "SuperAdmin" role
 * can access or manage these endpoints.
 */

router.post(
  "/register",
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.CreateSuperAdmin(),
  ValidateRequest,
  SuperAdminController.Register
);

router.get("/verify/:token", 
  ValidateToken,
  SuperAdminController.Activate
);

router.post(
  "/login",
  ...SuperAdminValidator.Login(),
  ValidateRequest,
  SuperAdminController.Login
);

router.get("/" ,
  IsAuthenticated,
  IsSuperAdmin, 
  SuperAdminController.GetAll
)

router.delete(
  "/:username" , 
  IsAuthenticated,
  IsSuperAdmin,
  ...SuperAdminValidator.UsernameParam() , 
  ValidateRequest , 
  SuperAdminController.Delete
);

export default router;
