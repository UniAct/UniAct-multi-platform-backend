import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import ValidateRequest from "../Middlewares/ModelValidationMiddleware";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { CourseController } from "../Controllers/CourseController";
import permissions from "../Utils/Permissions.json";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { CourseParamSchema, CreateCourseSchema, UpdateCourseSchema } from "../Validators/CourseValidator";
import UserValidator from "../Validators/UserValidator";
import { GetAllStaffCoursesParams } from "../Interfaces/Course/GetAllStaffCourses/GetAllStaffCoursesSchema";
import { AssignCourseAssessmentBody, AssignCourseAssessmentParams } from "../Interfaces/Course/AssignCourseAssessment/AssignCourseAssessmentSchema";
import { GetCourseStudentsParams } from "../Interfaces/Course/GetCourseStudent/GetCourseStudentSchema";
import { UpdateStudentGradeBody, UpdateStudentGradeParam } from "../Interfaces/Course/UpdateStudentGrade/UpdateStudentGradeSchema";
import { GetCourseAssessmentParams } from "../Interfaces/Course/GetCourseAssessment/GetCourseAssessmentSchema";
import { UpdateCourseAssessmentBody, UpdateCourseAssessmentParams } from "../Interfaces/Course/UpdateCourseAssessment/UpdateCourseAssessmentSchema";
import {
  CreateCourseAssessmentBody,
  CreateCourseAssessmentParams,
  DeleteCourseAssessmentParams,
} from "../Interfaces/Course/CreateCourseAssessment/CreateCourseAssessmentSchema";

const router = Router();

router.post(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.create.name),
  ZodValidator({body:CreateCourseSchema}),
  ValidateRequest,
  asyncHandler(CourseController.CreateCourse),
);

router.get(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.read.name),
  asyncHandler(CourseController.GetAllCourses),
);

router.get(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.read.name),
  ZodValidator({params:CourseParamSchema}),
  asyncHandler(CourseController.GetCourseById),
);

router.put(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.update.name),
  ZodValidator({params: CourseParamSchema}),
  ZodValidator({body:UpdateCourseSchema}),
  asyncHandler(CourseController.UpdateCourse),
);

router.delete(
  "/:id",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.delete.name),
  ZodValidator({params: CourseParamSchema}),
  asyncHandler(CourseController.DeleteCourse),
);


// get all courses of a specific staff (in the current semester)
router.get(                          
  "/staff/:staffId",
  IsAuthenticated,
  AttachAndValidateTenant,
  RequirePermission(permissions.course.read.name),
  ZodValidator({ params: GetAllStaffCoursesParams }),
  asyncHandler(CourseController.GetAllStaffCourses)
);

// assign course assessment for a specific course (in the current semester)
router.post(
  "/:courseId/assign-course-assessments",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({
    params: AssignCourseAssessmentParams,
    body:   AssignCourseAssessmentBody,
  }),
  asyncHandler(CourseController.AssignCourseAssessment)
);

// create one assessment column for a course in the current semester
router.post(
  "/:courseId/course-assessments",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({
    params: CreateCourseAssessmentParams,
    body: CreateCourseAssessmentBody,
  }),
  asyncHandler(CourseController.CreateCourseAssessment)
);


// get course assessment for a specific course
router.get(
  "/:courseId/course-assessments",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ params: GetCourseAssessmentParams }),
  asyncHandler(CourseController.GetCourseAssessment)
);

// updating course assessment
router.patch(
  "/:courseId/course-assessments",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({
    params: UpdateCourseAssessmentParams,
    body:   UpdateCourseAssessmentBody,
  }),
  asyncHandler(CourseController.UpdateCourseAssessment)
);

// delete an assessment column and its grade records
router.delete(
  "/course-assessments/:assessmentId",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ params: DeleteCourseAssessmentParams }),
  asyncHandler(CourseController.DeleteCourseAssessment)
);


// get all students that register for a specific course
router.get(
  "/:courseId/students",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ params: GetCourseStudentsParams }),
  asyncHandler(CourseController.GetCourseStudents)
);

// update student grade
router.patch(
  "/grade/:gradeId",
  IsAuthenticated,
  AttachAndValidateTenant,
  ZodValidator({ 
    params: UpdateStudentGradeParam,
    body:   UpdateStudentGradeBody,
  }),
  asyncHandler(CourseController.UpdateStudentGrade)
);

export default router;
