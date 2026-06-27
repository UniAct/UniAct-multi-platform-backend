import { Router } from "express";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { StorageController } from "../Controllers/StorageController";

const router = Router();

router.get("/:bucketName/:objectName", asyncHandler(StorageController.GetObject));

export default router;
