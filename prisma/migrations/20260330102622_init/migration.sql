-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "template";

-- CreateEnum
CREATE TYPE "template"."ProgramType" AS ENUM ('Bachelor', 'Master', 'Diploma', 'PhD');

-- CreateEnum
CREATE TYPE "template"."ResultDisplayType" AS ENUM ('CourseGrade', 'DetailedEstimate');

-- CreateEnum
CREATE TYPE "template"."BlockReasonType" AS ENUM ('NonPaymentCurrent', 'NonPaymentOld');

-- CreateEnum
CREATE TYPE "template"."StudentStatus" AS ENUM ('New', 'Repeat', 'SingleChance', 'ExternalReenrollment', 'Deactivate');

-- CreateEnum
CREATE TYPE "template"."SemesterType" AS ENUM ('Fall', 'Spring', 'Summer', 'Winter');

-- CreateEnum
CREATE TYPE "template"."FeeType" AS ENUM ('ConstantYear', 'ConstantSemester', 'PerCreditHour', 'PerCourse', 'Administrative', 'Other');

-- CreateEnum
CREATE TYPE "template"."CourseAssessmentType" AS ENUM ('Quiz', 'Assignment', 'Midterm', 'Final', 'Project');

-- CreateEnum
CREATE TYPE "template"."CourseType" AS ENUM ('Mandatory', 'Elective', 'Project');

-- CreateEnum
CREATE TYPE "template"."FeeStatus" AS ENUM ('Pending', 'Paid');

-- CreateEnum
CREATE TYPE "template"."ClassroomType" AS ENUM ('Lecture', 'Lab', 'Auditorium', 'Other');

-- CreateEnum
CREATE TYPE "template"."DayOfWeek" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- CreateEnum
CREATE TYPE "template"."RegistrationStatus" AS ENUM ('Enrolled', 'Withdrawn', 'Completed', 'Failed', 'InProgress');

-- CreateEnum
CREATE TYPE "template"."GradeEnum" AS ENUM ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F');

-- CreateEnum
CREATE TYPE "template"."AttendanceMode" AS ENUM ('Manual', 'QRCode', 'Biometric', 'Geofencing', 'Hotspot', 'Online');

-- CreateEnum
CREATE TYPE "template"."AttendanceStatus" AS ENUM ('Present', 'Absent', 'Late', 'Excused', 'Medical');

-- CreateEnum
CREATE TYPE "template"."RoomRole" AS ENUM ('Owner', 'Member');

-- CreateEnum
CREATE TYPE "template"."PostType" AS ENUM ('ANNOUNCEMENT', 'ASSIGNMENT', 'MATERIAL');

-- CreateEnum
CREATE TYPE "template"."StorageProvider" AS ENUM ('LOCAL', 'S3', 'Azure Blob Storage', 'Google Cloud Storage');

-- CreateEnum
CREATE TYPE "template"."JobStatus" AS ENUM ('Pending', 'Processing', 'Completed', 'Failed', 'CompletedWithErrors');

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "established_date" TIMESTAMP(3),
    "accreditation" TEXT,
    "db_schema" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Job" (
    "id" UUID NOT NULL,
    "file_url" VARCHAR(512) NOT NULL,
    "status" "template"."JobStatus" NOT NULL DEFAULT 'Pending',
    "total_rows" INTEGER,
    "inserted_rows" INTEGER,
    "failed_rows" INTEGER,
    "error_log" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password" VARCHAR(60) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "phone" VARCHAR(15) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "national_id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Staff" (
    "user_id" INTEGER NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    "cv_path" VARCHAR(1000),
    "hire_date" DATE NOT NULL,
    "salary" DECIMAL(12,2),

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "template"."Faculty" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "dean_id" INTEGER,
    "established_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Program" (
    "id" SERIAL NOT NULL,
    "faculty_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "head_id" INTEGER,
    "phone" VARCHAR(20),
    "university_credit_hours" INTEGER NOT NULL DEFAULT 0,
    "faculty_credit_hours" INTEGER NOT NULL DEFAULT 0,
    "program_credit_hours" INTEGER NOT NULL DEFAULT 0,
    "program_type" "template"."ProgramType" NOT NULL,
    "result_display" "template"."ResultDisplayType" NOT NULL DEFAULT 'CourseGrade',
    "block_reason" "template"."BlockReasonType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Student" (
    "user_id" INTEGER NOT NULL,
    "university_student_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "status" "template"."StudentStatus" NOT NULL DEFAULT 'New',
    "enrollment_date" DATE NOT NULL,
    "cgpa" DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    "home_phone" VARCHAR(20),
    "previous_qualification" VARCHAR(255),
    "secondary_school_name" VARCHAR(255),
    "total_high_school_grades" DECIMAL(5,2),
    "high_school_seat_number" VARCHAR(50),
    "program_level_id" INTEGER NOT NULL,
    "religion" CHAR(1) NOT NULL,
    "gender" CHAR(1) NOT NULL,
    "fullname" VARCHAR(100),

    CONSTRAINT "Student_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "template"."Regulation" (
    "id" SERIAL NOT NULL,
    "faculty_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "round_to_whole_number" BOOLEAN NOT NULL DEFAULT false,
    "approximate_fractions" BOOLEAN NOT NULL DEFAULT false,
    "max_absence" INTEGER NOT NULL DEFAULT 0,
    "min_grade_excellent" DECIMAL(5,2) NOT NULL,
    "min_grade_very_good" DECIMAL(5,2) NOT NULL,
    "min_grade_good" DECIMAL(5,2) NOT NULL,
    "min_grade_acceptable" DECIMAL(5,2) NOT NULL,
    "min_grade_very_weak" DECIMAL(5,2) NOT NULL,
    "enable_mercy_rules" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Regulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."MercyRule" (
    "id" SERIAL NOT NULL,
    "regulation_id" INTEGER NOT NULL,
    "original_score" DECIMAL(5,2) NOT NULL,
    "adjusted_score" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Semester" (
    "id" SERIAL NOT NULL,
    "year" SMALLINT NOT NULL,
    "term" SMALLINT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "type" "template"."SemesterType" NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."ProgramLevel" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "min_credits" INTEGER NOT NULL DEFAULT 0,
    "max_credits" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Fee" (
    "id" SERIAL NOT NULL,
    "program_level_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "fee_type" "template"."FeeType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."ProgramTranscriptDefinition" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "grade_letter" VARCHAR(10) NOT NULL,
    "min_score" DECIMAL(5,2) NOT NULL,
    "max_score" DECIMAL(5,2) NOT NULL,
    "equivalent_estimate" VARCHAR(20),
    "min_gpa" DECIMAL(5,4) NOT NULL,
    "max_gpa" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramTranscriptDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."AcademicLoadSemester" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "program_level_id" INTEGER NOT NULL,
    "min_credits" INTEGER NOT NULL,
    "max_credits" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicLoadSemester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."AcademicLoadGPA" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "min_gpa" DECIMAL(5,4) NOT NULL,
    "max_gpa" DECIMAL(5,4) NOT NULL,
    "min_credits" INTEGER NOT NULL,
    "max_credits" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicLoadGPA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Course" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL,
    "syllabus" TEXT,
    "success_percentage" DECIMAL(5,2),
    "total_fail" BOOLEAN NOT NULL DEFAULT false,
    "min_final_success_percentage" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Classroom" (
    "id" SERIAL NOT NULL,
    "room_number" VARCHAR(50) NOT NULL,
    "building" VARCHAR(100) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "type" "template"."ClassroomType" NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Room" (
    "id" SERIAL NOT NULL,
    "room_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_by" INTEGER NOT NULL,
    "max_members" INTEGER,
    "access_code" VARCHAR(50),
    "allow_student_posts" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."ClassSession" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "classroom_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "academic_level" INTEGER NOT NULL,
    "day_of_week" "template"."DayOfWeek" NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."CourseAssessment" (
    "id" SERIAL NOT NULL,
    "class_session_id" INTEGER NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "assessment_type" "template"."CourseAssessmentType" NOT NULL,
    "marks" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."ProgramCourse" (
    "program_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "type" "template"."CourseType" NOT NULL,

    CONSTRAINT "ProgramCourse_pkey" PRIMARY KEY ("program_id","course_id")
);

-- CreateTable
CREATE TABLE "template"."CoursePrerequisite" (
    "course_id" INTEGER NOT NULL,
    "prerequisite_id" INTEGER NOT NULL,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("course_id","prerequisite_id")
);

-- CreateTable
CREATE TABLE "template"."StudentFeeReport" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "program_level_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "fee_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "template"."FeeStatus" NOT NULL DEFAULT 'Pending',
    "generated_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentFeeReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."UserRole" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "template"."RolePermission" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "template"."CourseRegistration" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "enrollment_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "template"."RegistrationStatus" NOT NULL DEFAULT 'Enrolled',
    "grade" "template"."GradeEnum",
    "grade_points" INTEGER,

    CONSTRAINT "CourseRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Grade" (
    "id" SERIAL NOT NULL,
    "course_registration_id" INTEGER NOT NULL,
    "course_assessment_id" INTEGER NOT NULL,
    "marks" DECIMAL(5,2) NOT NULL,
    "max_marks" DECIMAL(5,2) NOT NULL,
    "assessment_date" DATE,
    "comments" TEXT,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."Transcript" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "semester_gpa" DECIMAL(5,4) NOT NULL,
    "cumulative_gpa" DECIMAL(5,4) NOT NULL,
    "total_credits" INTEGER NOT NULL DEFAULT 0,
    "generated_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."AttendanceSession" (
    "id" SERIAL NOT NULL,
    "class_session_id" INTEGER NOT NULL,
    "faculty_member_id" INTEGER NOT NULL,
    "session_date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "attendance_mode" "template"."AttendanceMode" NOT NULL,
    "hotspot_ssid" VARCHAR(255),
    "qr_code" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_notes" TEXT,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."StudentAttendance" (
    "id" SERIAL NOT NULL,
    "attendance_session_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "status" "template"."AttendanceStatus" NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_ip" INET,
    "device_mac" VARCHAR(17),
    "notes" TEXT,
    "is_offline_sync" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3),

    CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."AttendanceReport" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "attended_sessions" INTEGER NOT NULL DEFAULT 0,
    "attendance_percentage" DECIMAL(5,2) NOT NULL,
    "report_period_start" DATE NOT NULL,
    "report_period_end" DATE NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."RoomMember" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "template"."RoomRole" NOT NULL DEFAULT 'Member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."RoomPost" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT,
    "post_type" "template"."PostType" NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."RoomPostAttachment" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "storage_provider" "template"."StorageProvider" NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "file_size" BIGINT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomPostAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."RoomPostComment" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomPostComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_username_key" ON "SuperAdmin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "SuperAdmin"("email");

-- CreateIndex
CREATE INDEX "idx_superadmin_username" ON "SuperAdmin"("username");

-- CreateIndex
CREATE INDEX "idx_superadmin_email" ON "SuperAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "University_name_key" ON "University"("name");

-- CreateIndex
CREATE UNIQUE INDEX "University_db_schema_key" ON "University"("db_schema");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "template"."Job"("status");

-- CreateIndex
CREATE INDEX "Job_created_at_idx" ON "template"."Job"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "template"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "template"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_national_id_key" ON "template"."User"("national_id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "template"."User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "template"."User"("username");

-- CreateIndex
CREATE INDEX "User_national_id_idx" ON "template"."User"("national_id");

-- CreateIndex
CREATE INDEX "Staff_position_idx" ON "template"."Staff"("position");

-- CreateIndex
CREATE INDEX "Faculty_university_id_idx" ON "template"."Faculty"("university_id");

-- CreateIndex
CREATE INDEX "Faculty_name_idx" ON "template"."Faculty"("name");

-- CreateIndex
CREATE INDEX "Faculty_dean_id_idx" ON "template"."Faculty"("dean_id");

-- CreateIndex
CREATE INDEX "Program_faculty_id_idx" ON "template"."Program"("faculty_id");

-- CreateIndex
CREATE INDEX "Program_program_type_idx" ON "template"."Program"("program_type");

-- CreateIndex
CREATE INDEX "Program_head_id_idx" ON "template"."Program"("head_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_university_student_id_key" ON "template"."Student"("university_student_id");

-- CreateIndex
CREATE INDEX "Student_program_id_idx" ON "template"."Student"("program_id");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "template"."Student"("status");

-- CreateIndex
CREATE INDEX "Student_university_student_id_idx" ON "template"."Student"("university_student_id");

-- CreateIndex
CREATE INDEX "Regulation_faculty_id_idx" ON "template"."Regulation"("faculty_id");

-- CreateIndex
CREATE INDEX "MercyRule_regulation_id_idx" ON "template"."MercyRule"("regulation_id");

-- CreateIndex
CREATE INDEX "Semester_year_idx" ON "template"."Semester"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_year_term_key" ON "template"."Semester"("year", "term");

-- CreateIndex
CREATE INDEX "ProgramLevel_program_id_idx" ON "template"."ProgramLevel"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramLevel_program_id_level_key" ON "template"."ProgramLevel"("program_id", "level");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramLevel_id_program_id_key" ON "template"."ProgramLevel"("id", "program_id");

-- CreateIndex
CREATE INDEX "Fee_program_level_id_idx" ON "template"."Fee"("program_level_id");

-- CreateIndex
CREATE INDEX "Fee_semester_id_idx" ON "template"."Fee"("semester_id");

-- CreateIndex
CREATE INDEX "Fee_fee_type_idx" ON "template"."Fee"("fee_type");

-- CreateIndex
CREATE UNIQUE INDEX "Fee_program_level_id_semester_id_fee_type_key" ON "template"."Fee"("program_level_id", "semester_id", "fee_type");

-- CreateIndex
CREATE INDEX "ProgramTranscriptDefinition_program_id_idx" ON "template"."ProgramTranscriptDefinition"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramTranscriptDefinition_program_id_grade_letter_key" ON "template"."ProgramTranscriptDefinition"("program_id", "grade_letter");

-- CreateIndex
CREATE INDEX "AcademicLoadSemester_program_id_idx" ON "template"."AcademicLoadSemester"("program_id");

-- CreateIndex
CREATE INDEX "AcademicLoadSemester_semester_id_idx" ON "template"."AcademicLoadSemester"("semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicLoadSemester_program_id_semester_id_program_level_i_key" ON "template"."AcademicLoadSemester"("program_id", "semester_id", "program_level_id");

-- CreateIndex
CREATE INDEX "AcademicLoadGPA_program_id_idx" ON "template"."AcademicLoadGPA"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "template"."Course"("code");

-- CreateIndex
CREATE INDEX "Course_code_idx" ON "template"."Course"("code");

-- CreateIndex
CREATE INDEX "Classroom_building_idx" ON "template"."Classroom"("building");

-- CreateIndex
CREATE INDEX "Classroom_is_available_idx" ON "template"."Classroom"("is_available");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_room_number_building_key" ON "template"."Classroom"("room_number", "building");

-- CreateIndex
CREATE INDEX "Room_created_by_idx" ON "template"."Room"("created_by");

-- CreateIndex
CREATE INDEX "Room_access_code_idx" ON "template"."Room"("access_code");

-- CreateIndex
CREATE INDEX "ClassSession_course_id_idx" ON "template"."ClassSession"("course_id");

-- CreateIndex
CREATE INDEX "ClassSession_teacher_id_idx" ON "template"."ClassSession"("teacher_id");

-- CreateIndex
CREATE INDEX "ClassSession_program_id_idx" ON "template"."ClassSession"("program_id");

-- CreateIndex
CREATE INDEX "ClassSession_semester_id_idx" ON "template"."ClassSession"("semester_id");

-- CreateIndex
CREATE INDEX "ClassSession_day_of_week_start_time_idx" ON "template"."ClassSession"("day_of_week", "start_time");

-- CreateIndex
CREATE INDEX "CourseAssessment_class_session_id_idx" ON "template"."CourseAssessment"("class_session_id");

-- CreateIndex
CREATE INDEX "CourseAssessment_assessment_type_idx" ON "template"."CourseAssessment"("assessment_type");

-- CreateIndex
CREATE INDEX "ProgramCourse_course_id_idx" ON "template"."ProgramCourse"("course_id");

-- CreateIndex
CREATE INDEX "ProgramCourse_type_idx" ON "template"."ProgramCourse"("type");

-- CreateIndex
CREATE INDEX "CoursePrerequisite_prerequisite_id_idx" ON "template"."CoursePrerequisite"("prerequisite_id");

-- CreateIndex
CREATE INDEX "StudentFeeReport_student_id_idx" ON "template"."StudentFeeReport"("student_id");

-- CreateIndex
CREATE INDEX "StudentFeeReport_semester_id_idx" ON "template"."StudentFeeReport"("semester_id");

-- CreateIndex
CREATE INDEX "StudentFeeReport_status_idx" ON "template"."StudentFeeReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "template"."Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "template"."Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "template"."Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_name_idx" ON "template"."Permission"("name");

-- CreateIndex
CREATE INDEX "UserRole_role_id_idx" ON "template"."UserRole"("role_id");

-- CreateIndex
CREATE INDEX "RolePermission_permission_id_idx" ON "template"."RolePermission"("permission_id");

-- CreateIndex
CREATE INDEX "CourseRegistration_student_id_idx" ON "template"."CourseRegistration"("student_id");

-- CreateIndex
CREATE INDEX "CourseRegistration_session_id_idx" ON "template"."CourseRegistration"("session_id");

-- CreateIndex
CREATE INDEX "CourseRegistration_semester_id_idx" ON "template"."CourseRegistration"("semester_id");

-- CreateIndex
CREATE INDEX "CourseRegistration_status_idx" ON "template"."CourseRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRegistration_student_id_session_id_semester_id_key" ON "template"."CourseRegistration"("student_id", "session_id", "semester_id");

-- CreateIndex
CREATE INDEX "Grade_course_registration_id_idx" ON "template"."Grade"("course_registration_id");

-- CreateIndex
CREATE INDEX "Grade_course_assessment_id_idx" ON "template"."Grade"("course_assessment_id");

-- CreateIndex
CREATE INDEX "Transcript_student_id_idx" ON "template"."Transcript"("student_id");

-- CreateIndex
CREATE INDEX "Transcript_semester_id_idx" ON "template"."Transcript"("semester_id");

-- CreateIndex
CREATE INDEX "Transcript_year_idx" ON "template"."Transcript"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_student_id_semester_id_key" ON "template"."Transcript"("student_id", "semester_id");

-- CreateIndex
CREATE INDEX "AttendanceSession_class_session_id_idx" ON "template"."AttendanceSession"("class_session_id");

-- CreateIndex
CREATE INDEX "AttendanceSession_session_date_idx" ON "template"."AttendanceSession"("session_date");

-- CreateIndex
CREATE INDEX "AttendanceSession_faculty_member_id_idx" ON "template"."AttendanceSession"("faculty_member_id");

-- CreateIndex
CREATE INDEX "AttendanceSession_is_active_idx" ON "template"."AttendanceSession"("is_active");

-- CreateIndex
CREATE INDEX "StudentAttendance_attendance_session_id_idx" ON "template"."StudentAttendance"("attendance_session_id");

-- CreateIndex
CREATE INDEX "StudentAttendance_student_id_idx" ON "template"."StudentAttendance"("student_id");

-- CreateIndex
CREATE INDEX "StudentAttendance_status_idx" ON "template"."StudentAttendance"("status");

-- CreateIndex
CREATE INDEX "StudentAttendance_recorded_at_idx" ON "template"."StudentAttendance"("recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_attendance_session_id_student_id_key" ON "template"."StudentAttendance"("attendance_session_id", "student_id");

-- CreateIndex
CREATE INDEX "AttendanceReport_course_id_idx" ON "template"."AttendanceReport"("course_id");

-- CreateIndex
CREATE INDEX "AttendanceReport_student_id_idx" ON "template"."AttendanceReport"("student_id");

-- CreateIndex
CREATE INDEX "AttendanceReport_report_period_start_report_period_end_idx" ON "template"."AttendanceReport"("report_period_start", "report_period_end");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceReport_course_id_student_id_report_period_start_r_key" ON "template"."AttendanceReport"("course_id", "student_id", "report_period_start", "report_period_end");

-- CreateIndex
CREATE INDEX "RoomMember_room_id_idx" ON "template"."RoomMember"("room_id");

-- CreateIndex
CREATE INDEX "RoomMember_user_id_idx" ON "template"."RoomMember"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "RoomMember_room_id_user_id_key" ON "template"."RoomMember"("room_id", "user_id");

-- CreateIndex
CREATE INDEX "RoomPost_room_id_idx" ON "template"."RoomPost"("room_id");

-- CreateIndex
CREATE INDEX "RoomPost_author_id_idx" ON "template"."RoomPost"("author_id");

-- CreateIndex
CREATE INDEX "RoomPost_created_at_idx" ON "template"."RoomPost"("created_at");

-- CreateIndex
CREATE INDEX "RoomPost_is_pinned_room_id_idx" ON "template"."RoomPost"("is_pinned", "room_id");

-- CreateIndex
CREATE INDEX "RoomPostAttachment_post_id_idx" ON "template"."RoomPostAttachment"("post_id");

-- CreateIndex
CREATE INDEX "RoomPostComment_post_id_idx" ON "template"."RoomPostComment"("post_id");

-- CreateIndex
CREATE INDEX "RoomPostComment_author_id_idx" ON "template"."RoomPostComment"("author_id");

-- CreateIndex
CREATE INDEX "RoomPostComment_created_at_idx" ON "template"."RoomPostComment"("created_at");

-- AddForeignKey
ALTER TABLE "template"."Staff" ADD CONSTRAINT "Staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "template"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Faculty" ADD CONSTRAINT "Faculty_dean_id_fkey" FOREIGN KEY ("dean_id") REFERENCES "template"."Staff"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Program" ADD CONSTRAINT "Program_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "template"."Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Program" ADD CONSTRAINT "Program_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "template"."Staff"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Student" ADD CONSTRAINT "Student_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Student" ADD CONSTRAINT "Student_program_level_id_program_id_fkey" FOREIGN KEY ("program_level_id", "program_id") REFERENCES "template"."ProgramLevel"("id", "program_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Student" ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "template"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Regulation" ADD CONSTRAINT "Regulation_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "template"."Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."MercyRule" ADD CONSTRAINT "MercyRule_regulation_id_fkey" FOREIGN KEY ("regulation_id") REFERENCES "template"."Regulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ProgramLevel" ADD CONSTRAINT "ProgramLevel_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Fee" ADD CONSTRAINT "Fee_program_level_id_fkey" FOREIGN KEY ("program_level_id") REFERENCES "template"."ProgramLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Fee" ADD CONSTRAINT "Fee_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ProgramTranscriptDefinition" ADD CONSTRAINT "ProgramTranscriptDefinition_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."AcademicLoadSemester" ADD CONSTRAINT "AcademicLoadSemester_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."AcademicLoadSemester" ADD CONSTRAINT "AcademicLoadSemester_program_level_id_fkey" FOREIGN KEY ("program_level_id") REFERENCES "template"."ProgramLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."AcademicLoadSemester" ADD CONSTRAINT "AcademicLoadSemester_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."AcademicLoadGPA" ADD CONSTRAINT "AcademicLoadGPA_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Room" ADD CONSTRAINT "Room_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "template"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ClassSession" ADD CONSTRAINT "ClassSession_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "template"."Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ClassSession" ADD CONSTRAINT "ClassSession_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ClassSession" ADD CONSTRAINT "ClassSession_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ClassSession" ADD CONSTRAINT "ClassSession_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "template"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ClassSession" ADD CONSTRAINT "ClassSession_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ClassSession" ADD CONSTRAINT "ClassSession_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "template"."Staff"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CourseAssessment" ADD CONSTRAINT "CourseAssessment_class_session_id_fkey" FOREIGN KEY ("class_session_id") REFERENCES "template"."ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ProgramCourse" ADD CONSTRAINT "ProgramCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ProgramCourse" ADD CONSTRAINT "ProgramCourse_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "template"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."StudentFeeReport" ADD CONSTRAINT "StudentFeeReport_fee_id_fkey" FOREIGN KEY ("fee_id") REFERENCES "template"."Fee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."StudentFeeReport" ADD CONSTRAINT "StudentFeeReport_program_level_id_fkey" FOREIGN KEY ("program_level_id") REFERENCES "template"."ProgramLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."StudentFeeReport" ADD CONSTRAINT "StudentFeeReport_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."StudentFeeReport" ADD CONSTRAINT "StudentFeeReport_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "template"."Student"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."UserRole" ADD CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "template"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "template"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."RolePermission" ADD CONSTRAINT "RolePermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "template"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."RolePermission" ADD CONSTRAINT "RolePermission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "template"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CourseRegistration" ADD CONSTRAINT "CourseRegistration_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CourseRegistration" ADD CONSTRAINT "CourseRegistration_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "template"."ClassSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CourseRegistration" ADD CONSTRAINT "CourseRegistration_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "template"."Student"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Grade" ADD CONSTRAINT "Grade_course_assessment_id_fkey" FOREIGN KEY ("course_assessment_id") REFERENCES "template"."CourseAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Grade" ADD CONSTRAINT "Grade_course_registration_id_fkey" FOREIGN KEY ("course_registration_id") REFERENCES "template"."CourseRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Transcript" ADD CONSTRAINT "Transcript_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."Transcript" ADD CONSTRAINT "Transcript_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "template"."Student"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."AttendanceSession" ADD CONSTRAINT "AttendanceSession_class_session_id_fkey" FOREIGN KEY ("class_session_id") REFERENCES "template"."ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."AttendanceSession" ADD CONSTRAINT "AttendanceSession_faculty_member_id_fkey" FOREIGN KEY ("faculty_member_id") REFERENCES "template"."Staff"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."StudentAttendance" ADD CONSTRAINT "StudentAttendance_attendance_session_id_fkey" FOREIGN KEY ("attendance_session_id") REFERENCES "template"."AttendanceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."StudentAttendance" ADD CONSTRAINT "StudentAttendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "template"."Student"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."AttendanceReport" ADD CONSTRAINT "AttendanceReport_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."AttendanceReport" ADD CONSTRAINT "AttendanceReport_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "template"."Student"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."RoomMember" ADD CONSTRAINT "RoomMember_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "template"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."RoomMember" ADD CONSTRAINT "RoomMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "template"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."RoomPost" ADD CONSTRAINT "RoomPost_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "template"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."RoomPost" ADD CONSTRAINT "RoomPost_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "template"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."RoomPostAttachment" ADD CONSTRAINT "RoomPostAttachment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "template"."RoomPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."RoomPostComment" ADD CONSTRAINT "RoomPostComment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "template"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."RoomPostComment" ADD CONSTRAINT "RoomPostComment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "template"."RoomPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
