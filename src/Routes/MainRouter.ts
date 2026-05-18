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
import attendanceRoutes from "./AttendanceRoutes";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";

const router = Router();

router.use('/superadmin', SuperAdminRoutes);

router.use('/university', UniversityRoutes);

router.use('/job', jobRoutes);

router.use('/user', UserRoutes);

router.use('/rbac', RBACRoutes);

router.use('/program', ProgramRoutes);

router.use("/faculty", facultyRoutes)

router.use("/course", courseRoutes)

router.use('/classroom', classroomRoutes);

router.use('/semester', semesterRoutes);

router.use('/schedule', classSessionRoutes);

router.use('/attendance', attendanceRoutes);

// global health check
router.get('/', (req, res) => {
    res.status(StatusCodes.ACCEPTED).json({
        status: 'success',
        message: 'UniAct Backend API Running',
        environment: process.env.NODE_ENV,
    });
});

// fallback for unexpected routes 
router.all(/.*/, (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        status: JSendStatus.FAIL,
        data: {
            route: "Not Found",
        }
    });
});


export default router;
