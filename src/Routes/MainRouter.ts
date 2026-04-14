import { Router } from "express";
import SuperAdminRoutes from "./SuperAdminRoutes";
import UniversityRoutes from "./UniversityRoutes";
import UserRoutes from "./UserRoutes";
import RBACRoutes from "./RBACRoutes";
import ProgramRoutes from "./ProgramRoutes";
import facultyRoutes from "./FacultyRoutes";
import courseRoutes from "./CourseRoutes";
import semesterRoutes from "./SemesterRoutes";
import jobRoutes from "./JobRoutes";
import classroomRoutes from "./ClassroomRoutes";
import classSessionRoutes from "./ScheduleRoutes";

const router = Router();

// SuperAdmin Routes
router.use('/superadmin', SuperAdminRoutes);
// University Routes
router.use('/university', UniversityRoutes);

router.use('/job', jobRoutes);

// User Routes (Staff/Student endpoints)
router.use('/user', UserRoutes);

// RBAC Routes (Role/Permission management)
router.use('/rbac', RBACRoutes);

router.use('/program', ProgramRoutes);

router.use("/faculty", facultyRoutes)

router.use("/course", courseRoutes)

router.use('/classroom', classroomRoutes);

router.use('/semester', semesterRoutes);

router.use('/schedule', classSessionRoutes);

export default router;
