import { Router } from "express";
import SuperAdminRoutes from "./SuperAdminRoutes";
import UniversityRoutes from "./UniversityRoutes";
import UserRoutes from "./UserRoutes";
import RBACRoutes from "./RBACRoutes";
import ProgramRoutes from "./ProgramRoutes";
import  facultyRoutes from "./FacultyRoutes";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { IsSuperAdmin } from "../Middlewares/SuperAdminMiddleware";
const router = Router();

// SuperAdmin Routes
router.use('/superadmin', );
// University Routes
// Youssef: i added these 2 middleware here instead of typing them in all of the routes inside
router.use('/university', IsAuthenticated, IsSuperAdmin, UniversityRoutes);

// User Routes (Staff/Student endpoints)
router.use('/user', UserRoutes);

// RBAC Routes (Role/Permission management)
router.use('/rbac', RBACRoutes);

router.use('/program', ProgramRoutes);

router.use("/fuculty", facultyRoutes )

export default router;