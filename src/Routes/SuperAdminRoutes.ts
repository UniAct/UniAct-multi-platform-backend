import { Router } from "express";
import SuperAdminController from "../Controllers/SuperAdminController";
import SuperAdminValidator from "../Validators/SuperAdminValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";

const router = Router();

router.route("/")
  .post(...SuperAdminValidator.CreateSuperAdmin() , ValidateRequest , SuperAdminController.create)
  .get(SuperAdminController.getAll)

router.patch(
  "/:username/deactivate" , 
  ...SuperAdminValidator.UsernameParam() , 
  ValidateRequest , 
  SuperAdminController.deactivate
);

router.patch("/:username/activate", 
  ...SuperAdminValidator.UsernameParam() , 
  ValidateRequest ,  
  SuperAdminController.activate
);

router.delete(
  "/:username" , 
  ...SuperAdminValidator.UsernameParam() , 
  ValidateRequest , 
  SuperAdminController.delete
);

export default router;
