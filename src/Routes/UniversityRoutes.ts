import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import UniversityValidator from "../Validators/UniversityValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import UniversityController from "../Controllers/UniversityController";

const router : Router = Router();


router.post(
  "/create",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.Create(),
  ValidateRequest,
  UniversityController.Create
);

router.get(
  "/",
  IsAuthenticated,
  IsSuperAdmin,
  UniversityController.GetAll
);


router.get(
  "/:id",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  UniversityController.GetById
);

router.delete(
  "/:id",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  UniversityController.Delete
);

router.put(
  "/assign",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.AssignTenant(),
  ValidateRequest,
  UniversityController.AssignTenant
);

export default router;