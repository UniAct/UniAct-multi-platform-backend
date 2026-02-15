import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import UniversityValidator from "../Validators/UniversityValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import UniversityController from "../Controllers/UniversityController";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";

const router: Router = Router();

router.post(
  "/create",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.Create(),
  ValidateRequest,
  UniversityController.Create
);

// Public
router.get("/list", UniversityController.List);

// Admin only
router.get("/", IsAuthenticated, IsSuperAdmin, UniversityController.GetAll);

router.get(
  "/:id",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  UniversityController.GetById
);

router.put(
  "/:id/activate",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  UniversityController.Activate
);

router.put(
  "/:id/deactivate",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  UniversityController.Deactivate
);

router.delete(
  "/:id",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  UniversityController.Delete
);

// Catch-all
router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;
