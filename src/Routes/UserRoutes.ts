import { Router } from "express";
import UserValidator from "../Validators/UserValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { UserController } from "../Controllers/UserController";
import { TenantResolver } from "../Middlewares/TenantResolver";
import { upload } from "../Utils/MulterConfiguration";
import { ParseMultipartData } from "../Middlewares/ParseMultipartData";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";

const router : Router = Router();

router.post(
  "/login",
  ...UserValidator.Login(),
  ValidateRequest,
  TenantResolver,
  UserController.Login
);

//! verify email
router.post(
  "/account/staff",
  TenantResolver,
  upload.single("cv"), 
  ParseMultipartData,
  ...UserValidator.CreateStaffAccount(), 
  ValidateRequest,
  UserController.CreateStaffAccount
);

//! TODO: Delete , Update , Read account for Student Account And Staff Account
//* Create Staff Account: Done

router.all(/.*/, (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: { route: "Route not found" }
    });
});

export default router;