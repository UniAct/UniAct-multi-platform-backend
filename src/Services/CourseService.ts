import { CourseRepository } from "../Repositories/CourseRepository";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../Types/Errors";
import { GetTenantClient } from "../Utils/prismaClient";
import { CreateCourse, UpdateCourse } from "../Validators/CourseValidator";
import { SemesterRepository } from "../Repositories/SemesterRepository";
import { MapGetAllStaffCourses } from "../Interfaces/Course/GetAllStaffCourses/Mapper";
import { AssignCourseAssessmentBodyType } from "../Interfaces/Course/AssignCourseAssessment/AssignCourseAssessmentSchema";
import { MapAssignCourseAssessment } from "../Interfaces/Course/AssignCourseAssessment/Mapper";
import { MapGetCourseStudents } from "../Interfaces/Course/GetCourseStudent/Mapper";
import { UpdateStudentGradeBodyType } from "../Interfaces/Course/UpdateStudentGrade/UpdateStudentGradeSchema";
import { MapUpdateStudentGrade } from "../Interfaces/Course/UpdateStudentGrade/Mapper";
import { MapGetCourseAssessment } from "../Interfaces/Course/GetCourseAssessment/Mapper";
import { UpdateCourseAssessmentBodyType } from "../Interfaces/Course/UpdateCourseAssessment/UpdateCourseAssessmentSchema";
import { MapUpdateCourseAssessment } from "../Interfaces/Course/UpdateCourseAssessment/Mapper";
import { TokenPayload } from "../Interfaces/TokenPayload";
import { CourseAccessService } from "./CourseAccessService";
import permissions from "../Utils/Permissions.json";
import { CreateCourseAssessmentBodyType } from "../Interfaces/Course/CreateCourseAssessment/CreateCourseAssessmentSchema";

export class CourseService {

  public static async CreateCourse(payload: CreateCourse, schema_name: string) {
    const prisma = GetTenantClient(schema_name);

      return CourseRepository.CreateCourse(payload, prisma);
  }

  public static async GetAllCourses(schema_name: string) {
    const prisma = GetTenantClient(schema_name);

    return CourseRepository.GetAllCourses(prisma);
  }

  public static async GetCourseById(id: number, schema_name: string) {
    const prisma = GetTenantClient(schema_name);

    const course = await CourseRepository.GetCourseById(id, prisma);

    if (!course) {
      throw new NotFoundError("This course doesn't exist");
    }

    return course;
  }

  public static async UpdateCourse(id: number, payload: UpdateCourse, schema_name: string) {
    const prisma = GetTenantClient(schema_name);

    // to check if it exists or not 
    await this.GetCourseById(id, schema_name)

    return await CourseRepository.UpdateCourse(id,payload,prisma);

  }

  public static async DeleteCourse(id: number, schema_name: string) {
  const prisma = GetTenantClient(schema_name);

    return CourseRepository.DeleteCourse(id, prisma);
  };

  public static async GetAllStaffCourses(staffId: number, schema_name: string, user: TokenPayload) {
    const prisma = GetTenantClient(schema_name);
    const hasAdminAccess = CourseAccessService.HasAdminRole(user);

    if (!hasAdminAccess && (!user.isStaff || user.id !== staffId)) {
      throw new ForbiddenError("You can only access your assigned courses.");
    }

    const currentSemester = await SemesterRepository.GetCurrentSemester(prisma, { id: true });

    if (!currentSemester) {
      throw new NotFoundError("No active semester found for the current semester");
    }
    
    const rawData = await CourseRepository.GetAllStaffCourses(staffId , currentSemester.id , prisma);

    const dto = MapGetAllStaffCourses(rawData);

    return dto;
  }

  public static async AssignCourseAssessment(
    courseId:    number,
    body:        AssignCourseAssessmentBodyType,
    schema_name: string,
    user:        TokenPayload
  ) {
    const prisma = GetTenantClient(schema_name);

    const currentSemester = await SemesterRepository.GetCurrentSemester(prisma, { id: true });
    if (!currentSemester) {
      throw new NotFoundError("No active semester found");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      courseId,
      currentSemester.id,
      permissions.courseAssessment.create.name,
    );

    // prevent duplicate labels for the same course in the same semester
    const existingAssessments = await CourseRepository.GetCourseAssessmentByCourseAndSemester(
      courseId,
      currentSemester.id,
      prisma,
      {label: true}
    );

    const existingLabels = new Set(existingAssessments.map((a) => a.label.toLowerCase()));
    const incomingLabels = body.assessments.map((a) => a.label.toLowerCase());
    const duplicates     = incomingLabels.filter((label) => existingLabels.has(label));

    if (duplicates.length > 0) {
      throw new ConflictError(`Assessments already exist: ${duplicates.join(", ")}`);
    }

    // fetch all enrolled students in this course for the current semester
    const enrolledRegistrations = await CourseRepository.GetEnrolledRegistrationIds(
      courseId,
      currentSemester.id,
      prisma
    );

    if (enrolledRegistrations.length === 0) {
      throw new BadRequestError("No enrolled students found for this course in the current semester.");
    }

    // create assessments + seed a grade record (marks = 0) for every student
    const createdAssessments = await prisma.$transaction(async (tx) => {
      const assessments = await CourseRepository.CourseAssessmentBulkCreate(
        courseId,
        currentSemester.id,
        body.assessments,
        tx
      );

      // for each new assessment, create one grade row per enrolled student
      const gradeRecords = assessments.flatMap((assessment) =>
        enrolledRegistrations.map((registration) => ({
          courseRegistrationId: registration.id,
          courseAssessmentId:   assessment.id,
          marks:                0,
          maxMarks:             Number(assessment.marks),
        }))
      );

      await CourseRepository.StudentGradeBulkCreate(gradeRecords, tx);

      return assessments;
    });

    return MapAssignCourseAssessment(createdAssessments);
  }

  public static async CreateCourseAssessment(
    courseId: number,
    body: CreateCourseAssessmentBodyType,
    schema_name: string,
    user: TokenPayload
  ) {
    const prisma = GetTenantClient(schema_name);

    const currentSemester = await SemesterRepository.GetCurrentSemester(prisma, { id: true });
    if (!currentSemester) {
      throw new NotFoundError("No active semester found");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      courseId,
      currentSemester.id,
      permissions.courseAssessment.create.name,
    );

    const existingAssessments = await CourseRepository.GetCourseAssessmentByCourseAndSemester(
      courseId,
      currentSemester.id,
      prisma,
      { label: true }
    );

    const normalizedLabel = body.label.trim().toLowerCase();
    if (existingAssessments.some((assessment) => assessment.label.trim().toLowerCase() === normalizedLabel)) {
      throw new ConflictError(`Assessment already exists: ${body.label}`);
    }

    const enrolledRegistrations = await CourseRepository.GetEnrolledRegistrationIds(
      courseId,
      currentSemester.id,
      prisma
    );

    const createdAssessment = await prisma.$transaction(async (tx) => {
      const assessment = await CourseRepository.CourseAssessmentCreate(courseId, currentSemester.id, body, tx);

      if (enrolledRegistrations.length > 0) {
        await CourseRepository.StudentGradeBulkCreate(
          enrolledRegistrations.map((registration) => ({
            courseRegistrationId: registration.id,
            courseAssessmentId: assessment.id,
            marks: 0,
            maxMarks: Number(assessment.marks),
          })),
          tx
        );
      }

      return assessment;
    });

    return {
      assessmentId: createdAssessment.id,
      label: createdAssessment.label,
      assessmentType: createdAssessment.assessmentType,
      maxMarks: Number(createdAssessment.marks),
    };
  }

  public static async GetCourseStudents(courseId: number, schema_name: string, user: TokenPayload) {
    const prisma = GetTenantClient(schema_name);

    const currentSemester = await SemesterRepository.GetCurrentSemester(prisma, { id: true });
    if (!currentSemester) {
      throw new NotFoundError("No active semester found");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      courseId,
      currentSemester.id,
      permissions.courseAssessment.read.name,
    );

    const rawData = await CourseRepository.GetCourseStudents(courseId, currentSemester.id, prisma);

    return MapGetCourseStudents(rawData);
  }

  public static async UpdateStudentGrade(
    gradeId:     number,
    body:        UpdateStudentGradeBodyType,
    schema_name: string,
    user:        TokenPayload
  ) {
    const prisma = GetTenantClient(schema_name);

    const existingGrade = await CourseRepository.GetStudentGradeById(gradeId, prisma);
    if (!existingGrade) {
      throw new NotFoundError("Grade not found");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      existingGrade.courseAssessment.courseId,
      existingGrade.courseAssessment.semesterId,
      permissions.courseAssessment.update.name,
    );

    const maxMarks = Number(existingGrade.maxMarks);
    if (body.marks > maxMarks) {
      throw new BadRequestError(
        `Marks cannot exceed the maximum allowed marks for this assessment (${maxMarks})`
      );
    }

    const rawData = await CourseRepository.UpdateById(gradeId, body.marks, prisma);

    return MapUpdateStudentGrade(rawData);
  }

  public static async GetCourseAssessment(courseId: number, schema_name: string, user: TokenPayload) {
    const prisma = GetTenantClient(schema_name);

    const currentSemester = await SemesterRepository.GetCurrentSemester(prisma, { id: true });
    if (!currentSemester) {
      throw new NotFoundError("No active semester found");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      courseId,
      currentSemester.id,
      permissions.courseAssessment.read.name,
    );

    const rawData = await CourseRepository.GetCourseAssessmentByCourseAndSemester(
      courseId,
      currentSemester.id,
      prisma,
      {
        id:             true,
        label:          true,
        assessmentType: true,
        marks:          true,
      }
    );

    return MapGetCourseAssessment(rawData);
  }

  public static async UpdateCourseAssessment(
    courseId:    number,
    body:        UpdateCourseAssessmentBodyType,
    schema_name: string,
    user:        TokenPayload
  ) {
    const prisma = GetTenantClient(schema_name);

    const currentSemester = await SemesterRepository.GetCurrentSemester(prisma, { id: true });
    if (!currentSemester) {
      throw new NotFoundError("No active semester found");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      courseId,
      currentSemester.id,
      permissions.courseAssessment.update.name,
    );

    const existingAssessments = await CourseRepository.GetCourseAssessmentByCourseAndSemester(
      courseId,
      currentSemester.id,
      prisma,
      { id: true }
    );

    const existingIds = new Set(existingAssessments.map((a) => a.id));
    const invalidIds  = body.assessments
      .filter((a) => !existingIds.has(a.assessmentId))
      .map((a) => a.assessmentId);

    if (invalidIds.length > 0) {
      throw new BadRequestError(
        `The following assessment IDs do not belong to this course: ${invalidIds.join(", ")}`
      );
    }

    const rawData = await CourseRepository.UpdateCourseAssessments(body.assessments, prisma);

    return MapUpdateCourseAssessment(rawData);
  }

  public static async DeleteCourseAssessment(
    assessmentId: number,
    schema_name: string,
    user: TokenPayload
  ) {
    const prisma = GetTenantClient(schema_name);

    const existingAssessment = await CourseRepository.GetCourseAssessmentById(assessmentId, prisma);
    if (!existingAssessment) {
      throw new NotFoundError("Assessment not found");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      existingAssessment.courseId,
      existingAssessment.semesterId,
      permissions.courseAssessment.update.name,
    );

    const deletedAssessment = await CourseRepository.DeleteCourseAssessment(assessmentId, prisma);

    return {
      assessmentId: deletedAssessment.id,
      label: deletedAssessment.label,
      assessmentType: deletedAssessment.assessmentType,
      maxMarks: Number(deletedAssessment.marks),
    };
  }
}
