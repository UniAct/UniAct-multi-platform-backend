import { Router } from "express";
import { FacultyController } from "../Controllers/FacultyController";
import IsAuthenticated from "../Middlewares/AuthMiddleware";

const router = Router();

router.post(
    "/",
    IsAuthenticated,
     FacultyController.CreateFaculty
    );
router.get("/", FacultyController.GetAllFaculties),
router.get("/:id", FacultyController.GetFacultyById);
router.delete("/", IsAuthenticated, FacultyController.DeleteFaculty);

export default router;