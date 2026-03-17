import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
import UniversityValidator from "../Validators/UniversityValidator";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import UniversityController from "../Controllers/UniversityController";
import JSendStatus from "../Enums/Jsend";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../Middlewares/ErrorHandler";

const router: Router = Router();

router.post(
  "/create",

  IsAuthenticated,
  ...UniversityValidator.Create(),
  ValidateRequest,
  asyncHandler(UniversityController.Create)
);

// Public
router.get("/list", asyncHandler(UniversityController.List));

// Admin only
router.get("/", IsAuthenticated, IsSuperAdmin, asyncHandler(UniversityController.GetAll));

router.get(
  "/:id",
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  asyncHandler(UniversityController.GetById)
);

router.put(
  "/:id/activate",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  asyncHandler(UniversityController.Activate)
);

router.put(
  "/:id/deactivate",
  IsAuthenticated,
  IsSuperAdmin,
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  asyncHandler(UniversityController.Deactivate)
);

router.delete(
  "/:id",
  ...UniversityValidator.IdParam(),
  ValidateRequest,
  asyncHandler(UniversityController.Delete)
);

// Catch-all
router.all(/.*/, (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: JSendStatus.FAIL,
    data: { route: "Route not found" },
  });
});

export default router;
