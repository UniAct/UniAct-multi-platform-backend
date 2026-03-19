import { Router } from "express";
import SuperAdminRoutes from "./SuperAdminRoutes";
import UniversityRoutes from "./UniversityRoutes";
import UserRoutes from "./UserRoutes";
import RBACRoutes from "./RBACRoutes";
import ProgramRoutes from "./ProgramRoutes";
import facultyRoutes from "./FacultyRoutes";
import courseRoutes from "./CourseRoutes";

const router = Router();

// SuperAdmin Routes
router.use('/superadmin', SuperAdminRoutes);
// University Routes
router.use('/university', UniversityRoutes);

// User Routes (Staff/Student endpoints)
router.use('/user', UserRoutes);

// RBAC Routes (Role/Permission management)
router.use('/rbac', RBACRoutes);

router.use('/program', ProgramRoutes);

router.use("/faculty", facultyRoutes)

router.use("/course", courseRoutes)

export default router;
