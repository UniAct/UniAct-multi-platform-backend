--
-- PostgreSQL database dump
--


-- Dumped from database version 17.2
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: template; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA __SCHEMA__;


--
-- Name: AnnouncementAudience; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."AnnouncementAudience" AS ENUM (
    'ALL',
    'STUDENTS',
    'STAFF',
    'FACULTY'
);


--
-- Name: AnnouncementStatus; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."AnnouncementStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);


--
-- Name: AnnouncementType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."AnnouncementType" AS ENUM (
    'ANNOUNCEMENT',
    'EVENT'
);


--
-- Name: AttendanceMode; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."AttendanceMode" AS ENUM (
    'Manual',
    'QRCode',
    'Biometric',
    'Geofencing',
    'Hotspot',
    'Online'
);


--
-- Name: AttendanceStatus; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."AttendanceStatus" AS ENUM (
    'Present',
    'Absent',
    'Late',
    'Excused',
    'Medical'
);


--
-- Name: BlockReasonType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."BlockReasonType" AS ENUM (
    'NonPaymentCurrent',
    'NonPaymentOld'
);


--
-- Name: ClassroomType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."ClassroomType" AS ENUM (
    'Hall',
    'Lab',
    'Auditorium',
    'Other'
);


--
-- Name: CourseAssessmentType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."CourseAssessmentType" AS ENUM (
    'Quiz',
    'Assignment',
    'Midterm',
    'Final',
    'Project'
);


--
-- Name: CourseType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."CourseType" AS ENUM (
    'Mandatory',
    'Elective',
    'Project'
);


--
-- Name: DayOfWeek; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."DayOfWeek" AS ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);


--
-- Name: EnrollmentJobStatus; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."EnrollmentJobStatus" AS ENUM (
    'Pending',
    'Processing',
    'Done'
);


--
-- Name: FeeStatus; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."FeeStatus" AS ENUM (
    'Pending',
    'Paid'
);


--
-- Name: FeeType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."FeeType" AS ENUM (
    'ConstantYear',
    'ConstantSemester',
    'PerCreditHour',
    'PerCourse',
    'Administrative',
    'Other'
);


--
-- Name: GradeEnum; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."GradeEnum" AS ENUM (
    'A+',
    'A',
    'A-',
    'B+',
    'B',
    'B-',
    'C+',
    'C',
    'C-',
    'D+',
    'D',
    'F'
);


--
-- Name: JobStatus; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."JobStatus" AS ENUM (
    'Pending',
    'Processing',
    'Completed',
    'Failed',
    'CompletedWithErrors'
);


--
-- Name: LearningGroupRole; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."LearningGroupRole" AS ENUM (
    'Owner',
    'Member'
);


--
-- Name: PostType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."PostType" AS ENUM (
    'ANNOUNCEMENT',
    'ASSIGNMENT',
    'MATERIAL'
);


--
-- Name: ProgramType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."ProgramType" AS ENUM (
    'Bachelor',
    'Master',
    'Diploma',
    'PhD'
);


--
-- Name: RegistrationStatus; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."RegistrationStatus" AS ENUM (
    'Enrolled',
    'Withdrawn',
    'Completed',
    'Failed',
    'InProgress'
);


--
-- Name: ResultDisplayType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."ResultDisplayType" AS ENUM (
    'CourseGrade',
    'DetailedEstimate'
);


--
-- Name: SemesterType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."SemesterType" AS ENUM (
    'Fall',
    'Spring',
    'Summer',
    'Winter'
);


--
-- Name: SlotType; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."SlotType" AS ENUM (
    'Lecture',
    'Lab',
    'Tutorial'
);


--
-- Name: StorageProvider; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."StorageProvider" AS ENUM (
    'LOCAL',
    'S3',
    'Azure Blob Storage',
    'Google Cloud Storage',
    'Cloudinary'
);


--
-- Name: StudentStatus; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."StudentStatus" AS ENUM (
    'New',
    'Repeat',
    'SingleChance',
    'ExternalReenrollment',
    'Deactivate'
);


--
-- Name: TranscriptJobStatus; Type: TYPE; Schema: template; Owner: -
--

CREATE TYPE __SCHEMA__."TranscriptJobStatus" AS ENUM (
    'Pending',
    'Processing',
    'Completed',
    'Failed',
    'Partial_failure'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AcademicLoadGPA; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."AcademicLoadGPA" (
    id integer NOT NULL,
    program_id integer NOT NULL,
    min_gpa numeric(5,4) NOT NULL,
    max_gpa numeric(5,4) NOT NULL,
    min_credits integer NOT NULL,
    max_credits integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: AcademicLoadGPA_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."AcademicLoadGPA_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AcademicLoadGPA_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."AcademicLoadGPA_id_seq" OWNED BY __SCHEMA__."AcademicLoadGPA".id;


--
-- Name: AcademicLoadSemester; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."AcademicLoadSemester" (
    id integer NOT NULL,
    program_id integer NOT NULL,
    program_level_id integer NOT NULL,
    min_credits integer NOT NULL,
    max_credits integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    semester_number smallint NOT NULL
);


--
-- Name: AcademicLoadSemester_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."AcademicLoadSemester_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AcademicLoadSemester_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."AcademicLoadSemester_id_seq" OWNED BY __SCHEMA__."AcademicLoadSemester".id;


--
-- Name: Announcement; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Announcement" (
    id integer NOT NULL,
    title character varying(300) NOT NULL,
    content text NOT NULL,
    type __SCHEMA__."AnnouncementType" DEFAULT 'ANNOUNCEMENT'::__SCHEMA__."AnnouncementType" NOT NULL,
    audience __SCHEMA__."AnnouncementAudience" DEFAULT 'ALL'::__SCHEMA__."AnnouncementAudience" NOT NULL,
    status __SCHEMA__."AnnouncementStatus" DEFAULT 'PUBLISHED'::__SCHEMA__."AnnouncementStatus" NOT NULL,
    event_date timestamp(3) without time zone,
    event_location character varying(300),
    author_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: Announcement_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Announcement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Announcement_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Announcement_id_seq" OWNED BY __SCHEMA__."Announcement".id;


--
-- Name: AttendanceReport; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."AttendanceReport" (
    id integer NOT NULL,
    course_id integer NOT NULL,
    student_id integer NOT NULL,
    total_sessions integer DEFAULT 0 NOT NULL,
    attended_sessions integer DEFAULT 0 NOT NULL,
    attendance_percentage numeric(5,2) NOT NULL,
    report_period_start date NOT NULL,
    report_period_end date NOT NULL,
    generated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AttendanceReport_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."AttendanceReport_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AttendanceReport_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."AttendanceReport_id_seq" OWNED BY __SCHEMA__."AttendanceReport".id;


--
-- Name: AttendanceSession; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."AttendanceSession" (
    id integer NOT NULL,
    faculty_member_id integer NOT NULL,
    session_date date NOT NULL,
    start_time time(6) without time zone NOT NULL,
    end_time time(6) without time zone NOT NULL,
    attendance_mode __SCHEMA__."AttendanceMode" NOT NULL,
    hotspot_ssid character varying(255),
    qr_code character varying(500),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    session_notes text,
    schedule_slot_id integer NOT NULL
);


--
-- Name: AttendanceSession_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."AttendanceSession_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AttendanceSession_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."AttendanceSession_id_seq" OWNED BY __SCHEMA__."AttendanceSession".id;


--
-- Name: Classroom; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Classroom" (
    id integer NOT NULL,
    building character varying(100) NOT NULL,
    capacity integer NOT NULL,
    type __SCHEMA__."ClassroomType" NOT NULL,
    classroom_number character varying(50) NOT NULL,
    "underMaintenance" boolean DEFAULT false NOT NULL
);


--
-- Name: Classroom_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Classroom_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Classroom_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Classroom_id_seq" OWNED BY __SCHEMA__."Classroom".id;


--
-- Name: Course; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Course" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(20) NOT NULL,
    description text,
    credits integer NOT NULL,
    syllabus text,
    success_percentage numeric(5,2),
    total_fail boolean DEFAULT false NOT NULL,
    min_final_success_percentage numeric(5,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: CourseAssessment; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."CourseAssessment" (
    id integer NOT NULL,
    label character varying(100) NOT NULL,
    assessment_type __SCHEMA__."CourseAssessmentType" NOT NULL,
    marks numeric(5,2) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    course_id integer NOT NULL,
    semester_id integer NOT NULL
);


--
-- Name: CourseAssessment_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."CourseAssessment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CourseAssessment_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."CourseAssessment_id_seq" OWNED BY __SCHEMA__."CourseAssessment".id;


--
-- Name: CoursePrerequisite; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."CoursePrerequisite" (
    course_id integer NOT NULL,
    prerequisite_id integer NOT NULL
);


--
-- Name: CourseRegistration; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."CourseRegistration" (
    id integer NOT NULL,
    student_id integer NOT NULL,
    semester_id integer NOT NULL,
    enrollment_date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status __SCHEMA__."RegistrationStatus" DEFAULT 'Enrolled'::__SCHEMA__."RegistrationStatus" NOT NULL,
    grade __SCHEMA__."GradeEnum",
    grade_points integer,
    "slot_context_Id" integer
);


--
-- Name: CourseRegistration_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."CourseRegistration_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CourseRegistration_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."CourseRegistration_id_seq" OWNED BY __SCHEMA__."CourseRegistration".id;


--
-- Name: Course_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Course_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Course_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Course_id_seq" OWNED BY __SCHEMA__."Course".id;


--
-- Name: EnrollmentJob; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."EnrollmentJob" (
    id uuid NOT NULL,
    student_id integer NOT NULL,
    semester_id integer NOT NULL,
    status __SCHEMA__."EnrollmentJobStatus" DEFAULT 'Pending'::__SCHEMA__."EnrollmentJobStatus" NOT NULL,
    result jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: Faculty; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Faculty" (
    id integer NOT NULL,
    university_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    dean_id integer,
    established_date date,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: Faculty_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Faculty_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Faculty_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Faculty_id_seq" OWNED BY __SCHEMA__."Faculty".id;


--
-- Name: Fee; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Fee" (
    id integer NOT NULL,
    program_level_id integer NOT NULL,
    fee_type __SCHEMA__."FeeType" NOT NULL,
    amount numeric(12,2) NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    semester_number smallint NOT NULL
);


--
-- Name: Fee_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Fee_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Fee_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Fee_id_seq" OWNED BY __SCHEMA__."Fee".id;


--
-- Name: Grade; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Grade" (
    id integer NOT NULL,
    course_registration_id integer NOT NULL,
    course_assessment_id integer NOT NULL,
    marks numeric(5,2) NOT NULL,
    max_marks numeric(5,2) NOT NULL,
    assessment_date date,
    comments text
);


--
-- Name: Grade_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Grade_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Grade_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Grade_id_seq" OWNED BY __SCHEMA__."Grade".id;


--
-- Name: Job; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Job" (
    id uuid NOT NULL,
    file_url character varying(512) NOT NULL,
    status __SCHEMA__."JobStatus" DEFAULT 'Pending'::__SCHEMA__."JobStatus" NOT NULL,
    total_rows integer,
    inserted_rows integer,
    failed_rows integer,
    error_log jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    started_at timestamp(6) with time zone,
    completed_at timestamp(6) with time zone
);


--
-- Name: LearningGroup; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."LearningGroup" (
    id integer NOT NULL,
    group_name character varying(255) NOT NULL,
    access_code character varying(50),
    allow_student_posts boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    course_id integer NOT NULL,
    semester_id integer NOT NULL
);


--
-- Name: LearningGroupMember; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."LearningGroupMember" (
    learning_group_id integer NOT NULL,
    user_id integer NOT NULL,
    role __SCHEMA__."LearningGroupRole" DEFAULT 'Member'::__SCHEMA__."LearningGroupRole" NOT NULL,
    joined_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: LearningGroupPost; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."LearningGroupPost" (
    id integer NOT NULL,
    learning_group_id integer NOT NULL,
    author_id integer NOT NULL,
    content text,
    post_type __SCHEMA__."PostType" NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    is_edited boolean DEFAULT false NOT NULL,
    due_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: LearningGroupPostAttachment; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."LearningGroupPostAttachment" (
    id integer NOT NULL,
    post_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    storage_provider __SCHEMA__."StorageProvider" NOT NULL,
    storage_path character varying(500) NOT NULL,
    file_size bigint,
    uploaded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: LearningGroupPostAttachment_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."LearningGroupPostAttachment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LearningGroupPostAttachment_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."LearningGroupPostAttachment_id_seq" OWNED BY __SCHEMA__."LearningGroupPostAttachment".id;


--
-- Name: LearningGroupPostComment; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."LearningGroupPostComment" (
    id integer NOT NULL,
    post_id integer NOT NULL,
    author_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    is_edited boolean DEFAULT false NOT NULL
);


--
-- Name: LearningGroupPostComment_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."LearningGroupPostComment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LearningGroupPostComment_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."LearningGroupPostComment_id_seq" OWNED BY __SCHEMA__."LearningGroupPostComment".id;


--
-- Name: LearningGroupPost_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."LearningGroupPost_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LearningGroupPost_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."LearningGroupPost_id_seq" OWNED BY __SCHEMA__."LearningGroupPost".id;


--
-- Name: LearningGroup_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."LearningGroup_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LearningGroup_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."LearningGroup_id_seq" OWNED BY __SCHEMA__."LearningGroup".id;


--
-- Name: MercyRule; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."MercyRule" (
    id integer NOT NULL,
    regulation_id integer NOT NULL,
    original_score numeric(5,2) NOT NULL,
    adjusted_score numeric(5,2) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: MercyRule_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."MercyRule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: MercyRule_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."MercyRule_id_seq" OWNED BY __SCHEMA__."MercyRule".id;


--
-- Name: Permission; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Permission" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: Permission_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Permission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Permission_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Permission_id_seq" OWNED BY __SCHEMA__."Permission".id;


--
-- Name: Program; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Program" (
    id integer NOT NULL,
    faculty_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    head_id integer,
    phone character varying(20),
    university_credit_hours integer DEFAULT 0 NOT NULL,
    faculty_credit_hours integer DEFAULT 0 NOT NULL,
    program_credit_hours integer DEFAULT 0 NOT NULL,
    program_type __SCHEMA__."ProgramType" NOT NULL,
    result_display __SCHEMA__."ResultDisplayType" DEFAULT 'CourseGrade'::__SCHEMA__."ResultDisplayType" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    duration_years integer
);


--
-- Name: ProgramCourse; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."ProgramCourse" (
    course_id integer NOT NULL,
    type __SCHEMA__."CourseType" NOT NULL,
    id integer NOT NULL,
    "programId" integer NOT NULL,
    program_level_id integer NOT NULL
);


--
-- Name: ProgramCourse_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."ProgramCourse_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProgramCourse_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."ProgramCourse_id_seq" OWNED BY __SCHEMA__."ProgramCourse".id;


--
-- Name: ProgramLevel; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."ProgramLevel" (
    id integer NOT NULL,
    program_id integer NOT NULL,
    level integer NOT NULL,
    min_credits integer DEFAULT 0 NOT NULL,
    max_credits integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: ProgramLevel_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."ProgramLevel_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProgramLevel_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."ProgramLevel_id_seq" OWNED BY __SCHEMA__."ProgramLevel".id;


--
-- Name: ProgramStaff; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."ProgramStaff" (
    id integer NOT NULL,
    staff_id integer NOT NULL,
    program_id integer NOT NULL,
    faculty_id integer NOT NULL
);


--
-- Name: ProgramStaff_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."ProgramStaff_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProgramStaff_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."ProgramStaff_id_seq" OWNED BY __SCHEMA__."ProgramStaff".id;


--
-- Name: ProgramTranscriptDefinition; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."ProgramTranscriptDefinition" (
    id integer NOT NULL,
    program_id integer NOT NULL,
    min_score numeric(5,2) NOT NULL,
    max_score numeric(5,2) NOT NULL,
    equivalent_estimate character varying(20),
    min_gpa numeric(5,4) NOT NULL,
    max_gpa numeric(5,4) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    grade_letter __SCHEMA__."GradeEnum" NOT NULL
);


--
-- Name: ProgramTranscriptDefinition_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."ProgramTranscriptDefinition_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProgramTranscriptDefinition_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."ProgramTranscriptDefinition_id_seq" OWNED BY __SCHEMA__."ProgramTranscriptDefinition".id;


--
-- Name: Program_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Program_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Program_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Program_id_seq" OWNED BY __SCHEMA__."Program".id;


--
-- Name: Regulation; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Regulation" (
    id integer NOT NULL,
    faculty_id integer NOT NULL,
    name character varying(255) NOT NULL,
    round_to_whole_number boolean DEFAULT false NOT NULL,
    approximate_fractions boolean DEFAULT false NOT NULL,
    max_absence integer DEFAULT 0 NOT NULL,
    min_grade_excellent numeric(5,2) NOT NULL,
    min_grade_very_good numeric(5,2) NOT NULL,
    min_grade_good numeric(5,2) NOT NULL,
    min_grade_acceptable numeric(5,2) NOT NULL,
    min_grade_very_weak numeric(5,2) NOT NULL,
    enable_mercy_rules boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: Regulation_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Regulation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Regulation_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Regulation_id_seq" OWNED BY __SCHEMA__."Regulation".id;


--
-- Name: Role; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Role" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: RolePermission; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."RolePermission" (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Role_id_seq" OWNED BY __SCHEMA__."Role".id;


--
-- Name: ScheduleSlot; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."ScheduleSlot" (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    classroom_id integer NOT NULL,
    semester_id integer NOT NULL,
    day_of_week __SCHEMA__."DayOfWeek" NOT NULL,
    start_time time(6) without time zone NOT NULL,
    end_time time(6) without time zone NOT NULL,
    type __SCHEMA__."SlotType" DEFAULT 'Lecture'::__SCHEMA__."SlotType" NOT NULL,
    enrolled_seats smallint DEFAULT 0 NOT NULL,
    course_id integer NOT NULL,
    "allowedCapacity" smallint NOT NULL,
    CONSTRAINT valid_time_range CHECK ((start_time < end_time))
);


--
-- Name: ScheduleSlotContext; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."ScheduleSlotContext" (
    id integer NOT NULL,
    slot_id integer NOT NULL,
    program_id integer NOT NULL,
    academic_level integer NOT NULL,
    semester_id integer NOT NULL
);


--
-- Name: ScheduleSlotContext_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."ScheduleSlotContext_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ScheduleSlotContext_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."ScheduleSlotContext_id_seq" OWNED BY __SCHEMA__."ScheduleSlotContext".id;


--
-- Name: ScheduleSlot_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."ScheduleSlot_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ScheduleSlot_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."ScheduleSlot_id_seq" OWNED BY __SCHEMA__."ScheduleSlot".id;


--
-- Name: Semester; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Semester" (
    id integer NOT NULL,
    year smallint NOT NULL,
    term smallint NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    type __SCHEMA__."SemesterType" NOT NULL
);


--
-- Name: Semester_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Semester_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Semester_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Semester_id_seq" OWNED BY __SCHEMA__."Semester".id;


--
-- Name: Staff; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Staff" (
    user_id integer NOT NULL,
    "position" character varying(100) NOT NULL,
    cv_path character varying(1000),
    hire_date date NOT NULL,
    salary numeric(12,2)
);


--
-- Name: Student; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Student" (
    user_id integer NOT NULL,
    university_student_id integer NOT NULL,
    program_id integer NOT NULL,
    status __SCHEMA__."StudentStatus" DEFAULT 'New'::__SCHEMA__."StudentStatus" NOT NULL,
    enrollment_date date NOT NULL,
    cgpa numeric(5,4) DEFAULT 0.0000 NOT NULL,
    home_phone character varying(20),
    previous_qualification character varying(255),
    secondary_school_name character varying(255),
    total_high_school_grades numeric(5,2),
    high_school_seat_number character varying(50),
    program_level_id integer NOT NULL,
    religion character(1) NOT NULL,
    gender character(1) NOT NULL,
    fullname character varying(100)
);


--
-- Name: StudentAttendance; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."StudentAttendance" (
    id integer NOT NULL,
    attendance_session_id integer NOT NULL,
    student_id integer NOT NULL,
    status __SCHEMA__."AttendanceStatus" NOT NULL,
    recorded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    device_ip inet,
    device_mac character varying(17),
    notes text,
    is_offline_sync boolean DEFAULT false NOT NULL,
    synced_at timestamp(3) without time zone
);


--
-- Name: StudentAttendance_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."StudentAttendance_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: StudentAttendance_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."StudentAttendance_id_seq" OWNED BY __SCHEMA__."StudentAttendance".id;


--
-- Name: StudentFeeReport; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."StudentFeeReport" (
    id integer NOT NULL,
    student_id integer NOT NULL,
    program_level_id integer NOT NULL,
    semester_id integer NOT NULL,
    fee_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    status __SCHEMA__."FeeStatus" DEFAULT 'Pending'::__SCHEMA__."FeeStatus" NOT NULL,
    generated_date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: StudentFeeReport_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."StudentFeeReport_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: StudentFeeReport_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."StudentFeeReport_id_seq" OWNED BY __SCHEMA__."StudentFeeReport".id;


--
-- Name: Transcript; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."Transcript" (
    id integer NOT NULL,
    student_id integer NOT NULL,
    semester_id integer NOT NULL,
    year integer NOT NULL,
    semester_gpa numeric(5,4) NOT NULL,
    cumulative_gpa numeric(5,4) NOT NULL,
    total_credits integer DEFAULT 0 NOT NULL,
    generated_date date DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TranscriptJob; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."TranscriptJob" (
    id uuid NOT NULL,
    faculty_id integer NOT NULL,
    semester_id integer NOT NULL,
    status __SCHEMA__."TranscriptJobStatus" DEFAULT 'Pending'::__SCHEMA__."TranscriptJobStatus" NOT NULL,
    result jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: Transcript_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."Transcript_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Transcript_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."Transcript_id_seq" OWNED BY __SCHEMA__."Transcript".id;


--
-- Name: User; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."User" (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(320) NOT NULL,
    password character varying(60) NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    phone character varying(15) NOT NULL,
    date_of_birth date NOT NULL,
    address text NOT NULL,
    city character varying(100) NOT NULL,
    country character varying(100) NOT NULL,
    national_id character varying(50) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "blockReason" __SCHEMA__."BlockReasonType"
);


--
-- Name: UserRole; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__."UserRole" (
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: template; Owner: -
--

CREATE SEQUENCE __SCHEMA__."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: template; Owner: -
--

ALTER SEQUENCE __SCHEMA__."User_id_seq" OWNED BY __SCHEMA__."User".id;


--
-- Name: migrations; Type: TABLE; Schema: template; Owner: -
--

CREATE TABLE __SCHEMA__.migrations (
    name text NOT NULL,
    applied_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AcademicLoadGPA id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AcademicLoadGPA" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."AcademicLoadGPA_id_seq"'::regclass);


--
-- Name: AcademicLoadSemester id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AcademicLoadSemester" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."AcademicLoadSemester_id_seq"'::regclass);


--
-- Name: Announcement id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Announcement" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Announcement_id_seq"'::regclass);


--
-- Name: AttendanceReport id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AttendanceReport" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."AttendanceReport_id_seq"'::regclass);


--
-- Name: AttendanceSession id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AttendanceSession" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."AttendanceSession_id_seq"'::regclass);


--
-- Name: Classroom id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Classroom" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Classroom_id_seq"'::regclass);


--
-- Name: Course id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Course" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Course_id_seq"'::regclass);


--
-- Name: CourseAssessment id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CourseAssessment" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."CourseAssessment_id_seq"'::regclass);


--
-- Name: CourseRegistration id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CourseRegistration" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."CourseRegistration_id_seq"'::regclass);


--
-- Name: Faculty id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Faculty" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Faculty_id_seq"'::regclass);


--
-- Name: Fee id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Fee" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Fee_id_seq"'::regclass);


--
-- Name: Grade id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Grade" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Grade_id_seq"'::regclass);


--
-- Name: LearningGroup id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroup" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."LearningGroup_id_seq"'::regclass);


--
-- Name: LearningGroupPost id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPost" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."LearningGroupPost_id_seq"'::regclass);


--
-- Name: LearningGroupPostAttachment id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPostAttachment" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."LearningGroupPostAttachment_id_seq"'::regclass);


--
-- Name: LearningGroupPostComment id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPostComment" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."LearningGroupPostComment_id_seq"'::regclass);


--
-- Name: MercyRule id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."MercyRule" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."MercyRule_id_seq"'::regclass);


--
-- Name: Permission id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Permission" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Permission_id_seq"'::regclass);


--
-- Name: Program id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Program" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Program_id_seq"'::regclass);


--
-- Name: ProgramCourse id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramCourse" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."ProgramCourse_id_seq"'::regclass);


--
-- Name: ProgramLevel id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramLevel" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."ProgramLevel_id_seq"'::regclass);


--
-- Name: ProgramStaff id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramStaff" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."ProgramStaff_id_seq"'::regclass);


--
-- Name: ProgramTranscriptDefinition id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramTranscriptDefinition" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."ProgramTranscriptDefinition_id_seq"'::regclass);


--
-- Name: Regulation id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Regulation" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Regulation_id_seq"'::regclass);


--
-- Name: Role id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Role" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Role_id_seq"'::regclass);


--
-- Name: ScheduleSlot id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlot" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."ScheduleSlot_id_seq"'::regclass);


--
-- Name: ScheduleSlotContext id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlotContext" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."ScheduleSlotContext_id_seq"'::regclass);


--
-- Name: Semester id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Semester" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Semester_id_seq"'::regclass);


--
-- Name: StudentAttendance id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentAttendance" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."StudentAttendance_id_seq"'::regclass);


--
-- Name: StudentFeeReport id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentFeeReport" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."StudentFeeReport_id_seq"'::regclass);


--
-- Name: Transcript id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Transcript" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."Transcript_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."User" ALTER COLUMN id SET DEFAULT nextval('__SCHEMA__."User_id_seq"'::regclass);


--
-- Name: AcademicLoadGPA AcademicLoadGPA_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AcademicLoadGPA"
    ADD CONSTRAINT "AcademicLoadGPA_pkey" PRIMARY KEY (id);


--
-- Name: AcademicLoadSemester AcademicLoadSemester_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AcademicLoadSemester"
    ADD CONSTRAINT "AcademicLoadSemester_pkey" PRIMARY KEY (id);


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceReport AttendanceReport_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AttendanceReport"
    ADD CONSTRAINT "AttendanceReport_pkey" PRIMARY KEY (id);


--
-- Name: AttendanceSession AttendanceSession_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY (id);


--
-- Name: Classroom Classroom_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Classroom"
    ADD CONSTRAINT "Classroom_pkey" PRIMARY KEY (id);


--
-- Name: CourseAssessment CourseAssessment_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CourseAssessment"
    ADD CONSTRAINT "CourseAssessment_pkey" PRIMARY KEY (id);


--
-- Name: CoursePrerequisite CoursePrerequisite_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CoursePrerequisite"
    ADD CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY (course_id, prerequisite_id);


--
-- Name: CourseRegistration CourseRegistration_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CourseRegistration"
    ADD CONSTRAINT "CourseRegistration_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: EnrollmentJob EnrollmentJob_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."EnrollmentJob"
    ADD CONSTRAINT "EnrollmentJob_pkey" PRIMARY KEY (id);


--
-- Name: Faculty Faculty_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Faculty"
    ADD CONSTRAINT "Faculty_pkey" PRIMARY KEY (id);


--
-- Name: Fee Fee_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Fee"
    ADD CONSTRAINT "Fee_pkey" PRIMARY KEY (id);


--
-- Name: Grade Grade_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Grade"
    ADD CONSTRAINT "Grade_pkey" PRIMARY KEY (id);


--
-- Name: Job Job_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Job"
    ADD CONSTRAINT "Job_pkey" PRIMARY KEY (id);


--
-- Name: LearningGroupMember LearningGroupMember_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupMember"
    ADD CONSTRAINT "LearningGroupMember_pkey" PRIMARY KEY (learning_group_id, user_id);


--
-- Name: LearningGroupPostAttachment LearningGroupPostAttachment_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPostAttachment"
    ADD CONSTRAINT "LearningGroupPostAttachment_pkey" PRIMARY KEY (id);


--
-- Name: LearningGroupPostComment LearningGroupPostComment_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPostComment"
    ADD CONSTRAINT "LearningGroupPostComment_pkey" PRIMARY KEY (id);


--
-- Name: LearningGroupPost LearningGroupPost_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPost"
    ADD CONSTRAINT "LearningGroupPost_pkey" PRIMARY KEY (id);


--
-- Name: LearningGroup LearningGroup_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroup"
    ADD CONSTRAINT "LearningGroup_pkey" PRIMARY KEY (id);


--
-- Name: MercyRule MercyRule_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."MercyRule"
    ADD CONSTRAINT "MercyRule_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: ProgramCourse ProgramCourse_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramCourse"
    ADD CONSTRAINT "ProgramCourse_pkey" PRIMARY KEY (id);


--
-- Name: ProgramLevel ProgramLevel_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramLevel"
    ADD CONSTRAINT "ProgramLevel_pkey" PRIMARY KEY (id);


--
-- Name: ProgramStaff ProgramStaff_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramStaff"
    ADD CONSTRAINT "ProgramStaff_pkey" PRIMARY KEY (id);


--
-- Name: ProgramTranscriptDefinition ProgramTranscriptDefinition_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramTranscriptDefinition"
    ADD CONSTRAINT "ProgramTranscriptDefinition_pkey" PRIMARY KEY (id);


--
-- Name: Program Program_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Program"
    ADD CONSTRAINT "Program_pkey" PRIMARY KEY (id);


--
-- Name: Regulation Regulation_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Regulation"
    ADD CONSTRAINT "Regulation_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY (role_id, permission_id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: ScheduleSlotContext ScheduleSlotContext_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlotContext"
    ADD CONSTRAINT "ScheduleSlotContext_pkey" PRIMARY KEY (id);


--
-- Name: ScheduleSlot ScheduleSlot_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlot"
    ADD CONSTRAINT "ScheduleSlot_pkey" PRIMARY KEY (id);


--
-- Name: Semester Semester_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Semester"
    ADD CONSTRAINT "Semester_pkey" PRIMARY KEY (id);


--
-- Name: Staff Staff_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Staff"
    ADD CONSTRAINT "Staff_pkey" PRIMARY KEY (user_id);


--
-- Name: StudentAttendance StudentAttendance_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentAttendance"
    ADD CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY (id);


--
-- Name: StudentFeeReport StudentFeeReport_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentFeeReport"
    ADD CONSTRAINT "StudentFeeReport_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (user_id);


--
-- Name: TranscriptJob TranscriptJob_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."TranscriptJob"
    ADD CONSTRAINT "TranscriptJob_pkey" PRIMARY KEY (id);


--
-- Name: Transcript Transcript_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Transcript"
    ADD CONSTRAINT "Transcript_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY (user_id, role_id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (name);


--
-- Name: AcademicLoadGPA_program_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "AcademicLoadGPA_program_id_idx" ON __SCHEMA__."AcademicLoadGPA" USING btree (program_id);


--
-- Name: AcademicLoadSemester_program_id_semester_number_program_lev_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "AcademicLoadSemester_program_id_semester_number_program_lev_key" ON __SCHEMA__."AcademicLoadSemester" USING btree (program_id, semester_number, program_level_id);


--
-- Name: AcademicLoadSemester_semester_number_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "AcademicLoadSemester_semester_number_idx" ON __SCHEMA__."AcademicLoadSemester" USING btree (semester_number);


--
-- Name: Announcement_created_at_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Announcement_created_at_idx" ON __SCHEMA__."Announcement" USING btree (created_at DESC);


--
-- Name: Announcement_status_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Announcement_status_idx" ON __SCHEMA__."Announcement" USING btree (status);


--
-- Name: Announcement_type_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Announcement_type_idx" ON __SCHEMA__."Announcement" USING btree (type);


--
-- Name: AttendanceReport_course_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "AttendanceReport_course_id_idx" ON __SCHEMA__."AttendanceReport" USING btree (course_id);


--
-- Name: AttendanceReport_course_id_student_id_report_period_start_r_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "AttendanceReport_course_id_student_id_report_period_start_r_key" ON __SCHEMA__."AttendanceReport" USING btree (course_id, student_id, report_period_start, report_period_end);


--
-- Name: AttendanceReport_report_period_start_report_period_end_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "AttendanceReport_report_period_start_report_period_end_idx" ON __SCHEMA__."AttendanceReport" USING btree (report_period_start, report_period_end);


--
-- Name: AttendanceReport_student_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "AttendanceReport_student_id_idx" ON __SCHEMA__."AttendanceReport" USING btree (student_id);


--
-- Name: AttendanceSession_schedule_slot_id_session_date_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "AttendanceSession_schedule_slot_id_session_date_idx" ON __SCHEMA__."AttendanceSession" USING btree (schedule_slot_id, session_date);


--
-- Name: AttendanceSession_session_date_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "AttendanceSession_session_date_idx" ON __SCHEMA__."AttendanceSession" USING btree (session_date);


--
-- Name: Classroom_building_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Classroom_building_idx" ON __SCHEMA__."Classroom" USING btree (building);


--
-- Name: Classroom_classroom_number_building_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "Classroom_classroom_number_building_key" ON __SCHEMA__."Classroom" USING btree (classroom_number, building);


--
-- Name: Classroom_underMaintenance_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Classroom_underMaintenance_idx" ON __SCHEMA__."Classroom" USING btree ("underMaintenance");


--
-- Name: CourseAssessment_assessment_type_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "CourseAssessment_assessment_type_idx" ON __SCHEMA__."CourseAssessment" USING btree (assessment_type);


--
-- Name: CourseAssessment_course_id_semester_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "CourseAssessment_course_id_semester_id_idx" ON __SCHEMA__."CourseAssessment" USING btree (course_id, semester_id);


--
-- Name: CoursePrerequisite_prerequisite_id_course_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "CoursePrerequisite_prerequisite_id_course_id_idx" ON __SCHEMA__."CoursePrerequisite" USING btree (prerequisite_id, course_id);


--
-- Name: CourseRegistration_semester_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "CourseRegistration_semester_id_idx" ON __SCHEMA__."CourseRegistration" USING btree (semester_id);


--
-- Name: CourseRegistration_slot_context_Id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "CourseRegistration_slot_context_Id_idx" ON __SCHEMA__."CourseRegistration" USING btree ("slot_context_Id");


--
-- Name: CourseRegistration_status_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "CourseRegistration_status_idx" ON __SCHEMA__."CourseRegistration" USING btree (status);


--
-- Name: CourseRegistration_student_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "CourseRegistration_student_id_idx" ON __SCHEMA__."CourseRegistration" USING btree (student_id);


--
-- Name: CourseRegistration_student_id_slot_context_Id_semester_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "CourseRegistration_student_id_slot_context_Id_semester_id_key" ON __SCHEMA__."CourseRegistration" USING btree (student_id, "slot_context_Id", semester_id);


--
-- Name: Course_code_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "Course_code_key" ON __SCHEMA__."Course" USING btree (code);


--
-- Name: Course_code_name_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Course_code_name_idx" ON __SCHEMA__."Course" USING btree (code, name);


--
-- Name: Course_name_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Course_name_idx" ON __SCHEMA__."Course" USING btree (name);


--
-- Name: EnrollmentJob_status_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "EnrollmentJob_status_idx" ON __SCHEMA__."EnrollmentJob" USING btree (status);


--
-- Name: EnrollmentJob_student_id_semester_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "EnrollmentJob_student_id_semester_id_idx" ON __SCHEMA__."EnrollmentJob" USING btree (student_id, semester_id);


--
-- Name: Faculty_dean_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Faculty_dean_id_idx" ON __SCHEMA__."Faculty" USING btree (dean_id);


--
-- Name: Faculty_name_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Faculty_name_idx" ON __SCHEMA__."Faculty" USING btree (name);


--
-- Name: Faculty_university_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Faculty_university_id_idx" ON __SCHEMA__."Faculty" USING btree (university_id);


--
-- Name: Fee_fee_type_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Fee_fee_type_idx" ON __SCHEMA__."Fee" USING btree (fee_type);


--
-- Name: Fee_program_level_id_semester_number_fee_type_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "Fee_program_level_id_semester_number_fee_type_key" ON __SCHEMA__."Fee" USING btree (program_level_id, semester_number, fee_type);


--
-- Name: Fee_semester_number_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Fee_semester_number_idx" ON __SCHEMA__."Fee" USING btree (semester_number);


--
-- Name: Grade_course_assessment_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Grade_course_assessment_id_idx" ON __SCHEMA__."Grade" USING btree (course_assessment_id);


--
-- Name: Grade_course_registration_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Grade_course_registration_id_idx" ON __SCHEMA__."Grade" USING btree (course_registration_id);


--
-- Name: Job_created_at_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Job_created_at_idx" ON __SCHEMA__."Job" USING btree (created_at);


--
-- Name: Job_status_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Job_status_idx" ON __SCHEMA__."Job" USING btree (status);


--
-- Name: LearningGroupMember_user_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "LearningGroupMember_user_id_idx" ON __SCHEMA__."LearningGroupMember" USING btree (user_id);


--
-- Name: LearningGroupPostAttachment_post_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "LearningGroupPostAttachment_post_id_idx" ON __SCHEMA__."LearningGroupPostAttachment" USING btree (post_id);


--
-- Name: LearningGroupPostComment_author_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "LearningGroupPostComment_author_id_idx" ON __SCHEMA__."LearningGroupPostComment" USING btree (author_id);


--
-- Name: LearningGroupPostComment_post_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "LearningGroupPostComment_post_id_idx" ON __SCHEMA__."LearningGroupPostComment" USING btree (post_id);


--
-- Name: LearningGroupPost_author_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "LearningGroupPost_author_id_idx" ON __SCHEMA__."LearningGroupPost" USING btree (author_id);


--
-- Name: LearningGroupPost_learning_group_id_post_type_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "LearningGroupPost_learning_group_id_post_type_idx" ON __SCHEMA__."LearningGroupPost" USING btree (learning_group_id, post_type);


--
-- Name: LearningGroup_course_id_semester_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "LearningGroup_course_id_semester_id_key" ON __SCHEMA__."LearningGroup" USING btree (course_id, semester_id);


--
-- Name: LearningGroup_semester_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "LearningGroup_semester_id_idx" ON __SCHEMA__."LearningGroup" USING btree (semester_id);


--
-- Name: MercyRule_regulation_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "MercyRule_regulation_id_idx" ON __SCHEMA__."MercyRule" USING btree (regulation_id);


--
-- Name: Permission_name_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Permission_name_idx" ON __SCHEMA__."Permission" USING btree (name);


--
-- Name: Permission_name_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "Permission_name_key" ON __SCHEMA__."Permission" USING btree (name);


--
-- Name: ProgramCourse_course_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ProgramCourse_course_id_idx" ON __SCHEMA__."ProgramCourse" USING btree (course_id);


--
-- Name: ProgramCourse_programId_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ProgramCourse_programId_idx" ON __SCHEMA__."ProgramCourse" USING btree ("programId");


--
-- Name: ProgramCourse_program_level_id_course_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "ProgramCourse_program_level_id_course_id_key" ON __SCHEMA__."ProgramCourse" USING btree (program_level_id, course_id);


--
-- Name: ProgramCourse_type_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ProgramCourse_type_idx" ON __SCHEMA__."ProgramCourse" USING btree (type);


--
-- Name: ProgramLevel_id_program_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "ProgramLevel_id_program_id_key" ON __SCHEMA__."ProgramLevel" USING btree (id, program_id);


--
-- Name: ProgramLevel_program_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ProgramLevel_program_id_idx" ON __SCHEMA__."ProgramLevel" USING btree (program_id);


--
-- Name: ProgramLevel_program_id_level_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "ProgramLevel_program_id_level_key" ON __SCHEMA__."ProgramLevel" USING btree (program_id, level);


--
-- Name: ProgramStaff_faculty_id_staff_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ProgramStaff_faculty_id_staff_id_idx" ON __SCHEMA__."ProgramStaff" USING btree (faculty_id, staff_id);


--
-- Name: ProgramStaff_staff_id_program_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "ProgramStaff_staff_id_program_id_key" ON __SCHEMA__."ProgramStaff" USING btree (staff_id, program_id);


--
-- Name: ProgramTranscriptDefinition_program_id_grade_letter_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "ProgramTranscriptDefinition_program_id_grade_letter_key" ON __SCHEMA__."ProgramTranscriptDefinition" USING btree (program_id, grade_letter);


--
-- Name: ProgramTranscriptDefinition_program_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ProgramTranscriptDefinition_program_id_idx" ON __SCHEMA__."ProgramTranscriptDefinition" USING btree (program_id);


--
-- Name: Program_faculty_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Program_faculty_id_idx" ON __SCHEMA__."Program" USING btree (faculty_id);


--
-- Name: Program_head_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Program_head_id_idx" ON __SCHEMA__."Program" USING btree (head_id);


--
-- Name: Program_name_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "Program_name_key" ON __SCHEMA__."Program" USING btree (name);


--
-- Name: Program_program_type_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Program_program_type_idx" ON __SCHEMA__."Program" USING btree (program_type);


--
-- Name: Regulation_faculty_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Regulation_faculty_id_idx" ON __SCHEMA__."Regulation" USING btree (faculty_id);


--
-- Name: RolePermission_permission_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "RolePermission_permission_id_idx" ON __SCHEMA__."RolePermission" USING btree (permission_id);


--
-- Name: Role_name_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Role_name_idx" ON __SCHEMA__."Role" USING btree (name);


--
-- Name: Role_name_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "Role_name_key" ON __SCHEMA__."Role" USING btree (name);


--
-- Name: ScheduleSlotContext_semester_id_program_id_academic_level_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ScheduleSlotContext_semester_id_program_id_academic_level_idx" ON __SCHEMA__."ScheduleSlotContext" USING btree (semester_id, program_id, academic_level);


--
-- Name: ScheduleSlotContext_semester_id_slot_id_program_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "ScheduleSlotContext_semester_id_slot_id_program_id_key" ON __SCHEMA__."ScheduleSlotContext" USING btree (semester_id, slot_id, program_id);


--
-- Name: ScheduleSlotContext_slot_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ScheduleSlotContext_slot_id_idx" ON __SCHEMA__."ScheduleSlotContext" USING btree (slot_id);


--
-- Name: ScheduleSlot_classroom_id_day_of_week_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ScheduleSlot_classroom_id_day_of_week_idx" ON __SCHEMA__."ScheduleSlot" USING btree (classroom_id, day_of_week);


--
-- Name: ScheduleSlot_semester_id_day_of_week_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ScheduleSlot_semester_id_day_of_week_idx" ON __SCHEMA__."ScheduleSlot" USING btree (semester_id, day_of_week);


--
-- Name: ScheduleSlot_semester_id_teacher_id_classroom_id_day_of_wee_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "ScheduleSlot_semester_id_teacher_id_classroom_id_day_of_wee_key" ON __SCHEMA__."ScheduleSlot" USING btree (semester_id, teacher_id, classroom_id, day_of_week, start_time, end_time);


--
-- Name: ScheduleSlot_teacher_id_semester_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "ScheduleSlot_teacher_id_semester_id_idx" ON __SCHEMA__."ScheduleSlot" USING btree (teacher_id, semester_id);


--
-- Name: Semester_year_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Semester_year_idx" ON __SCHEMA__."Semester" USING btree (year);


--
-- Name: Semester_year_term_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "Semester_year_term_key" ON __SCHEMA__."Semester" USING btree (year, term);


--
-- Name: Staff_position_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Staff_position_idx" ON __SCHEMA__."Staff" USING btree ("position");


--
-- Name: StudentAttendance_attendance_session_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "StudentAttendance_attendance_session_id_idx" ON __SCHEMA__."StudentAttendance" USING btree (attendance_session_id);


--
-- Name: StudentAttendance_attendance_session_id_student_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "StudentAttendance_attendance_session_id_student_id_key" ON __SCHEMA__."StudentAttendance" USING btree (attendance_session_id, student_id);


--
-- Name: StudentAttendance_recorded_at_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "StudentAttendance_recorded_at_idx" ON __SCHEMA__."StudentAttendance" USING btree (recorded_at);


--
-- Name: StudentAttendance_status_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "StudentAttendance_status_idx" ON __SCHEMA__."StudentAttendance" USING btree (status);


--
-- Name: StudentAttendance_student_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "StudentAttendance_student_id_idx" ON __SCHEMA__."StudentAttendance" USING btree (student_id);


--
-- Name: StudentFeeReport_semester_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "StudentFeeReport_semester_id_idx" ON __SCHEMA__."StudentFeeReport" USING btree (semester_id);


--
-- Name: StudentFeeReport_status_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "StudentFeeReport_status_idx" ON __SCHEMA__."StudentFeeReport" USING btree (status);


--
-- Name: StudentFeeReport_student_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "StudentFeeReport_student_id_idx" ON __SCHEMA__."StudentFeeReport" USING btree (student_id);


--
-- Name: Student_program_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Student_program_id_idx" ON __SCHEMA__."Student" USING btree (program_id);


--
-- Name: Student_status_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Student_status_idx" ON __SCHEMA__."Student" USING btree (status);


--
-- Name: Student_university_student_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Student_university_student_id_idx" ON __SCHEMA__."Student" USING btree (university_student_id);


--
-- Name: Student_university_student_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "Student_university_student_id_key" ON __SCHEMA__."Student" USING btree (university_student_id);


--
-- Name: TranscriptJob_semester_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "TranscriptJob_semester_id_idx" ON __SCHEMA__."TranscriptJob" USING btree (semester_id);


--
-- Name: TranscriptJob_status_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "TranscriptJob_status_idx" ON __SCHEMA__."TranscriptJob" USING btree (status);


--
-- Name: Transcript_semester_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Transcript_semester_id_idx" ON __SCHEMA__."Transcript" USING btree (semester_id);


--
-- Name: Transcript_student_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Transcript_student_id_idx" ON __SCHEMA__."Transcript" USING btree (student_id);


--
-- Name: Transcript_student_id_semester_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "Transcript_student_id_semester_id_key" ON __SCHEMA__."Transcript" USING btree (student_id, semester_id);


--
-- Name: Transcript_year_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "Transcript_year_idx" ON __SCHEMA__."Transcript" USING btree (year);


--
-- Name: UserRole_role_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "UserRole_role_id_idx" ON __SCHEMA__."UserRole" USING btree (role_id);


--
-- Name: User_email_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "User_email_idx" ON __SCHEMA__."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON __SCHEMA__."User" USING btree (email);


--
-- Name: User_national_id_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "User_national_id_idx" ON __SCHEMA__."User" USING btree (national_id);


--
-- Name: User_national_id_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "User_national_id_key" ON __SCHEMA__."User" USING btree (national_id);


--
-- Name: User_username_idx; Type: INDEX; Schema: template; Owner: -
--

CREATE INDEX "User_username_idx" ON __SCHEMA__."User" USING btree (username);


--
-- Name: User_username_key; Type: INDEX; Schema: template; Owner: -
--

CREATE UNIQUE INDEX "User_username_key" ON __SCHEMA__."User" USING btree (username);


--
-- Name: AcademicLoadGPA AcademicLoadGPA_program_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AcademicLoadGPA"
    ADD CONSTRAINT "AcademicLoadGPA_program_id_fkey" FOREIGN KEY (program_id) REFERENCES __SCHEMA__."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AcademicLoadSemester AcademicLoadSemester_program_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AcademicLoadSemester"
    ADD CONSTRAINT "AcademicLoadSemester_program_id_fkey" FOREIGN KEY (program_id) REFERENCES __SCHEMA__."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AcademicLoadSemester AcademicLoadSemester_program_level_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AcademicLoadSemester"
    ADD CONSTRAINT "AcademicLoadSemester_program_level_id_fkey" FOREIGN KEY (program_level_id) REFERENCES __SCHEMA__."ProgramLevel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcement Announcement_author_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Announcement"
    ADD CONSTRAINT "Announcement_author_id_fkey" FOREIGN KEY (author_id) REFERENCES __SCHEMA__."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AttendanceReport AttendanceReport_course_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AttendanceReport"
    ADD CONSTRAINT "AttendanceReport_course_id_fkey" FOREIGN KEY (course_id) REFERENCES __SCHEMA__."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceReport AttendanceReport_student_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AttendanceReport"
    ADD CONSTRAINT "AttendanceReport_student_id_fkey" FOREIGN KEY (student_id) REFERENCES __SCHEMA__."Student"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttendanceSession AttendanceSession_faculty_member_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_faculty_member_id_fkey" FOREIGN KEY (faculty_member_id) REFERENCES __SCHEMA__."Staff"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AttendanceSession AttendanceSession_schedule_slot_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_schedule_slot_id_fkey" FOREIGN KEY (schedule_slot_id) REFERENCES __SCHEMA__."ScheduleSlot"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseAssessment CourseAssessment_course_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CourseAssessment"
    ADD CONSTRAINT "CourseAssessment_course_id_fkey" FOREIGN KEY (course_id) REFERENCES __SCHEMA__."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseAssessment CourseAssessment_semester_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CourseAssessment"
    ADD CONSTRAINT "CourseAssessment_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES __SCHEMA__."Semester"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CoursePrerequisite CoursePrerequisite_course_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CoursePrerequisite"
    ADD CONSTRAINT "CoursePrerequisite_course_id_fkey" FOREIGN KEY (course_id) REFERENCES __SCHEMA__."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CoursePrerequisite CoursePrerequisite_prerequisite_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CoursePrerequisite"
    ADD CONSTRAINT "CoursePrerequisite_prerequisite_id_fkey" FOREIGN KEY (prerequisite_id) REFERENCES __SCHEMA__."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseRegistration CourseRegistration_semester_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CourseRegistration"
    ADD CONSTRAINT "CourseRegistration_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES __SCHEMA__."Semester"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CourseRegistration CourseRegistration_slot_context_Id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CourseRegistration"
    ADD CONSTRAINT "CourseRegistration_slot_context_Id_fkey" FOREIGN KEY ("slot_context_Id") REFERENCES __SCHEMA__."ScheduleSlotContext"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CourseRegistration CourseRegistration_student_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."CourseRegistration"
    ADD CONSTRAINT "CourseRegistration_student_id_fkey" FOREIGN KEY (student_id) REFERENCES __SCHEMA__."Student"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EnrollmentJob EnrollmentJob_semester_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."EnrollmentJob"
    ADD CONSTRAINT "EnrollmentJob_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES __SCHEMA__."Semester"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EnrollmentJob EnrollmentJob_student_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."EnrollmentJob"
    ADD CONSTRAINT "EnrollmentJob_student_id_fkey" FOREIGN KEY (student_id) REFERENCES __SCHEMA__."Student"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Faculty Faculty_dean_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Faculty"
    ADD CONSTRAINT "Faculty_dean_id_fkey" FOREIGN KEY (dean_id) REFERENCES __SCHEMA__."Staff"(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Fee Fee_program_level_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Fee"
    ADD CONSTRAINT "Fee_program_level_id_fkey" FOREIGN KEY (program_level_id) REFERENCES __SCHEMA__."ProgramLevel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Grade Grade_course_assessment_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Grade"
    ADD CONSTRAINT "Grade_course_assessment_id_fkey" FOREIGN KEY (course_assessment_id) REFERENCES __SCHEMA__."CourseAssessment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Grade Grade_course_registration_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Grade"
    ADD CONSTRAINT "Grade_course_registration_id_fkey" FOREIGN KEY (course_registration_id) REFERENCES __SCHEMA__."CourseRegistration"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearningGroupMember LearningGroupMember_learning_group_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupMember"
    ADD CONSTRAINT "LearningGroupMember_learning_group_id_fkey" FOREIGN KEY (learning_group_id) REFERENCES __SCHEMA__."LearningGroup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearningGroupMember LearningGroupMember_user_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupMember"
    ADD CONSTRAINT "LearningGroupMember_user_id_fkey" FOREIGN KEY (user_id) REFERENCES __SCHEMA__."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearningGroupPostAttachment LearningGroupPostAttachment_post_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPostAttachment"
    ADD CONSTRAINT "LearningGroupPostAttachment_post_id_fkey" FOREIGN KEY (post_id) REFERENCES __SCHEMA__."LearningGroupPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearningGroupPostComment LearningGroupPostComment_author_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPostComment"
    ADD CONSTRAINT "LearningGroupPostComment_author_id_fkey" FOREIGN KEY (author_id) REFERENCES __SCHEMA__."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LearningGroupPostComment LearningGroupPostComment_post_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPostComment"
    ADD CONSTRAINT "LearningGroupPostComment_post_id_fkey" FOREIGN KEY (post_id) REFERENCES __SCHEMA__."LearningGroupPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearningGroupPost LearningGroupPost_author_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPost"
    ADD CONSTRAINT "LearningGroupPost_author_id_fkey" FOREIGN KEY (author_id) REFERENCES __SCHEMA__."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LearningGroupPost LearningGroupPost_learning_group_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroupPost"
    ADD CONSTRAINT "LearningGroupPost_learning_group_id_fkey" FOREIGN KEY (learning_group_id) REFERENCES __SCHEMA__."LearningGroup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearningGroup LearningGroup_course_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroup"
    ADD CONSTRAINT "LearningGroup_course_id_fkey" FOREIGN KEY (course_id) REFERENCES __SCHEMA__."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LearningGroup LearningGroup_semester_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."LearningGroup"
    ADD CONSTRAINT "LearningGroup_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES __SCHEMA__."Semester"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MercyRule MercyRule_regulation_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."MercyRule"
    ADD CONSTRAINT "MercyRule_regulation_id_fkey" FOREIGN KEY (regulation_id) REFERENCES __SCHEMA__."Regulation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramCourse ProgramCourse_course_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramCourse"
    ADD CONSTRAINT "ProgramCourse_course_id_fkey" FOREIGN KEY (course_id) REFERENCES __SCHEMA__."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramCourse ProgramCourse_programId_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramCourse"
    ADD CONSTRAINT "ProgramCourse_programId_fkey" FOREIGN KEY ("programId") REFERENCES __SCHEMA__."Program"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProgramCourse ProgramCourse_program_level_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramCourse"
    ADD CONSTRAINT "ProgramCourse_program_level_id_fkey" FOREIGN KEY (program_level_id) REFERENCES __SCHEMA__."ProgramLevel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramLevel ProgramLevel_program_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramLevel"
    ADD CONSTRAINT "ProgramLevel_program_id_fkey" FOREIGN KEY (program_id) REFERENCES __SCHEMA__."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramStaff ProgramStaff_faculty_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramStaff"
    ADD CONSTRAINT "ProgramStaff_faculty_id_fkey" FOREIGN KEY (faculty_id) REFERENCES __SCHEMA__."Faculty"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramStaff ProgramStaff_program_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramStaff"
    ADD CONSTRAINT "ProgramStaff_program_id_fkey" FOREIGN KEY (program_id) REFERENCES __SCHEMA__."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramStaff ProgramStaff_staff_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramStaff"
    ADD CONSTRAINT "ProgramStaff_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES __SCHEMA__."Staff"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProgramTranscriptDefinition ProgramTranscriptDefinition_program_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ProgramTranscriptDefinition"
    ADD CONSTRAINT "ProgramTranscriptDefinition_program_id_fkey" FOREIGN KEY (program_id) REFERENCES __SCHEMA__."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Program Program_faculty_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Program"
    ADD CONSTRAINT "Program_faculty_id_fkey" FOREIGN KEY (faculty_id) REFERENCES __SCHEMA__."Faculty"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Program Program_head_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Program"
    ADD CONSTRAINT "Program_head_id_fkey" FOREIGN KEY (head_id) REFERENCES __SCHEMA__."Staff"(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Regulation Regulation_faculty_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Regulation"
    ADD CONSTRAINT "Regulation_faculty_id_fkey" FOREIGN KEY (faculty_id) REFERENCES __SCHEMA__."Faculty"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_permission_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."RolePermission"
    ADD CONSTRAINT "RolePermission_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES __SCHEMA__."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_role_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."RolePermission"
    ADD CONSTRAINT "RolePermission_role_id_fkey" FOREIGN KEY (role_id) REFERENCES __SCHEMA__."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ScheduleSlotContext ScheduleSlotContext_program_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlotContext"
    ADD CONSTRAINT "ScheduleSlotContext_program_id_fkey" FOREIGN KEY (program_id) REFERENCES __SCHEMA__."Program"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ScheduleSlotContext ScheduleSlotContext_slot_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlotContext"
    ADD CONSTRAINT "ScheduleSlotContext_slot_id_fkey" FOREIGN KEY (slot_id) REFERENCES __SCHEMA__."ScheduleSlot"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ScheduleSlot ScheduleSlot_classroom_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlot"
    ADD CONSTRAINT "ScheduleSlot_classroom_id_fkey" FOREIGN KEY (classroom_id) REFERENCES __SCHEMA__."Classroom"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ScheduleSlot ScheduleSlot_course_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlot"
    ADD CONSTRAINT "ScheduleSlot_course_id_fkey" FOREIGN KEY (course_id) REFERENCES __SCHEMA__."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ScheduleSlot ScheduleSlot_semester_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlot"
    ADD CONSTRAINT "ScheduleSlot_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES __SCHEMA__."Semester"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ScheduleSlot ScheduleSlot_teacher_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."ScheduleSlot"
    ADD CONSTRAINT "ScheduleSlot_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES __SCHEMA__."Staff"(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Staff Staff_user_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Staff"
    ADD CONSTRAINT "Staff_user_id_fkey" FOREIGN KEY (user_id) REFERENCES __SCHEMA__."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentAttendance StudentAttendance_attendance_session_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentAttendance"
    ADD CONSTRAINT "StudentAttendance_attendance_session_id_fkey" FOREIGN KEY (attendance_session_id) REFERENCES __SCHEMA__."AttendanceSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentAttendance StudentAttendance_student_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentAttendance"
    ADD CONSTRAINT "StudentAttendance_student_id_fkey" FOREIGN KEY (student_id) REFERENCES __SCHEMA__."Student"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentFeeReport StudentFeeReport_fee_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentFeeReport"
    ADD CONSTRAINT "StudentFeeReport_fee_id_fkey" FOREIGN KEY (fee_id) REFERENCES __SCHEMA__."Fee"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentFeeReport StudentFeeReport_program_level_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentFeeReport"
    ADD CONSTRAINT "StudentFeeReport_program_level_id_fkey" FOREIGN KEY (program_level_id) REFERENCES __SCHEMA__."ProgramLevel"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentFeeReport StudentFeeReport_semester_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentFeeReport"
    ADD CONSTRAINT "StudentFeeReport_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES __SCHEMA__."Semester"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentFeeReport StudentFeeReport_student_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."StudentFeeReport"
    ADD CONSTRAINT "StudentFeeReport_student_id_fkey" FOREIGN KEY (student_id) REFERENCES __SCHEMA__."Student"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Student Student_program_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Student"
    ADD CONSTRAINT "Student_program_id_fkey" FOREIGN KEY (program_id) REFERENCES __SCHEMA__."Program"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_program_level_id_program_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Student"
    ADD CONSTRAINT "Student_program_level_id_program_id_fkey" FOREIGN KEY (program_level_id, program_id) REFERENCES __SCHEMA__."ProgramLevel"(id, program_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Student Student_user_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Student"
    ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY (user_id) REFERENCES __SCHEMA__."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TranscriptJob TranscriptJob_semester_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."TranscriptJob"
    ADD CONSTRAINT "TranscriptJob_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES __SCHEMA__."Semester"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transcript Transcript_semester_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Transcript"
    ADD CONSTRAINT "Transcript_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES __SCHEMA__."Semester"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transcript Transcript_student_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."Transcript"
    ADD CONSTRAINT "Transcript_student_id_fkey" FOREIGN KEY (student_id) REFERENCES __SCHEMA__."Student"(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_role_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."UserRole"
    ADD CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY (role_id) REFERENCES __SCHEMA__."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_user_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: -
--

ALTER TABLE ONLY __SCHEMA__."UserRole"
    ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY (user_id) REFERENCES __SCHEMA__."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


