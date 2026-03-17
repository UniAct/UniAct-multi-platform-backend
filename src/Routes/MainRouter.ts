import { Router } from "express";
import SuperAdminRoutes from "./SuperAdminRoutes";
import UniversityRoutes from "./UniversityRoutes";
import UserRoutes from "./UserRoutes";
import RBACRoutes from "./RBACRoutes";
import ProgramRoutes from "./ProgramRoutes";
import  facultyRoutes from "./FacultyRoutes";
import courseRoutes from "./CourseRoutes";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import UniversityController from "../Controllers/UniversityController";
import { asyncHandler } from "../Middlewares/ErrorHandler";
const router = Router();

// SuperAdmin Routes
router.use('/superadmin',SuperAdminRoutes );
// Public University Routes
router.get('/university/list', asyncHandler(UniversityController.List));
router.get('/university/public/:schema', asyncHandler(UniversityController.GetPublicBySchema));
// University Routes
// Youssef: i added these 2 middleware here instead of typing them in all of the routes inside
router.use('/university', IsAuthenticated, UniversityRoutes);

// User Routes (Staff/Student endpoints)
router.use('/user', UserRoutes);

// RBAC Routes (Role/Permission management)
router.use('/rbac', RBACRoutes);

router.use('/program', ProgramRoutes);

router.use("/faculty", facultyRoutes )

router.use("/course", courseRoutes )

export default router;
