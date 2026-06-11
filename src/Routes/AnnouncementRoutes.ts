import { Router } from "express";
import { AnnouncementController } from "../Controllers/AnnouncementController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { asyncHandler } from "../Middlewares/ErrorHandler";

const router = Router();

router.get("/public/:schema", asyncHandler(AnnouncementController.GetPublic));

router.get("/", IsAuthenticated, AttachAndValidateTenant, asyncHandler(AnnouncementController.GetAll));
router.post("/", IsAuthenticated, AttachAndValidateTenant, asyncHandler(AnnouncementController.Create));
router.put("/:id", IsAuthenticated, AttachAndValidateTenant, asyncHandler(AnnouncementController.Update));
router.delete("/:id", IsAuthenticated, AttachAndValidateTenant, asyncHandler(AnnouncementController.Delete));

export default router;
