-- ============================================================================================================
-- USER
-- ============================================================================================================

CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password VARCHAR(60) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    phone VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    national_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_user_username UNIQUE (username),
    CONSTRAINT uq_user_email UNIQUE (email),
    CONSTRAINT uq_user_national_id UNIQUE (national_id),
    CONSTRAINT chk_user_dob CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE)
);

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_user_national_id ON "User"(national_id);

-- ============================================================================================================
-- STAFF
-- ============================================================================================================

CREATE TABLE Staff (
    user_id INT PRIMARY KEY,
    position VARCHAR(100) NOT NULL,
    cv_path VARCHAR(1000),
    hire_date DATE NOT NULL,
    salary NUMERIC(12,2),

    CONSTRAINT fk_staff_user FOREIGN KEY (user_id)
        REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT chk_staff_hire_date CHECK (hire_date <= CURRENT_DATE),
    CONSTRAINT chk_staff_salary CHECK (salary IS NULL OR salary >= 0)
);

CREATE INDEX idx_staff_position ON Staff(position);

-- ============================================================================================================
-- FACULTY
-- ============================================================================================================

CREATE TABLE Faculty (
    id SERIAL PRIMARY KEY,
    university_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dean_id INT,
    established_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_faculty_university 
        FOREIGN KEY (university_id) REFERENCES public."University"(id) ON DELETE CASCADE,

    CONSTRAINT fk_faculty_dean 
        FOREIGN KEY (dean_id) REFERENCES Staff(user_id) ON DELETE SET NULL,

    CONSTRAINT chk_faculty_established_date 
        CHECK (established_date IS NULL OR established_date <= CURRENT_DATE)
);

CREATE INDEX idx_faculty_university ON Faculty(university_id);
CREATE INDEX idx_faculty_name ON Faculty(name);
CREATE INDEX idx_faculty_dean ON Faculty(dean_id);

-- ============================================================================================================
-- PROGRAM
-- ============================================================================================================

CREATE TYPE program_type AS ENUM ('Bachelor', 'Master', 'Diploma', 'PhD');
CREATE TYPE result_display_type AS ENUM ('CourseGrade', 'DetailedEstimate');
CREATE TYPE block_reason_type AS ENUM ('NonPaymentCurrent', 'NonPaymentOld');

CREATE TABLE Program (
    id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_id INT,  
    phone VARCHAR(20),
    university_credit_hours SMALLINT NOT NULL DEFAULT 0,
    faculty_credit_hours SMALLINT NOT NULL DEFAULT 0,
    program_credit_hours SMALLINT NOT NULL DEFAULT 0,
    program_type program_type NOT NULL,
    result_display result_display_type NOT NULL DEFAULT 'CourseGrade',
    block_reason block_reason_type,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_program_faculty 
        FOREIGN KEY (faculty_id) REFERENCES Faculty(id) ON DELETE CASCADE,

    CONSTRAINT fk_program_head 
        FOREIGN KEY (head_id) REFERENCES Staff(user_id) ON DELETE SET NULL,

    CONSTRAINT chk_program_credit_hours CHECK (
        university_credit_hours >= 0 AND
        faculty_credit_hours >= 0 AND
        program_credit_hours >= 0
    )
);

CREATE INDEX idx_program_faculty ON Program(faculty_id);
CREATE INDEX idx_program_type ON Program(program_type);
CREATE INDEX idx_program_head ON Program(head_id);

-- ============================================================================================================
-- STUDENT
-- ============================================================================================================

CREATE TYPE student_status AS ENUM ('New', 'Repeat', 'SingleChance', 'ExternalReenrollment', 'Deactivate');

CREATE TABLE Student (
    user_id INT PRIMARY KEY,
    university_student_id INT NOT NULL,
    program_id INT NOT NULL,
    academic_year VARCHAR(20),
    status student_status NOT NULL DEFAULT 'New',
    enrollment_date DATE NOT NULL,
    cgpa NUMERIC(5,4) DEFAULT 0.0000,
    religion BOOLEAN NOT NULL,
    gender BOOLEAN NOT NULL,
    passport VARCHAR(50),
    home_phone VARCHAR(20),
    previous_qualification VARCHAR(255),
    secondary_school_name VARCHAR(255),
    total_high_school_grades NUMERIC(5,2),
    high_school_seat_number VARCHAR(50),
    
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) 
        REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_program FOREIGN KEY (program_id) 
        REFERENCES Program(id) ON DELETE RESTRICT,
    CONSTRAINT uq_student_university_id UNIQUE (university_student_id),
    CONSTRAINT chk_student_cgpa CHECK (cgpa >= 0 AND cgpa <= 4.0),
    CONSTRAINT chk_student_enrollment_date CHECK (enrollment_date <= CURRENT_DATE),
    CONSTRAINT chk_student_high_school_grades CHECK (total_high_school_grades IS NULL OR total_high_school_grades >= 0)
);

CREATE INDEX idx_student_program ON Student(program_id);
CREATE INDEX idx_student_status ON Student(status);
CREATE INDEX idx_student_university_id ON Student(university_student_id);

-- ============================================================================================================
-- REGULATION
-- ============================================================================================================

CREATE TABLE Regulation (
    id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    round_to_whole_number BOOLEAN NOT NULL DEFAULT false,
    approximate_fractions BOOLEAN NOT NULL DEFAULT false,
    max_absence SMALLINT NOT NULL DEFAULT 0,
    min_grade_excellent NUMERIC(5,2) NOT NULL,
    min_grade_very_good NUMERIC(5,2) NOT NULL,
    min_grade_good NUMERIC(5,2) NOT NULL,
    min_grade_acceptable NUMERIC(5,2) NOT NULL,
    min_grade_very_weak NUMERIC(5,2) NOT NULL,
    enable_mercy_rules BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_regulation_faculty FOREIGN KEY (faculty_id) 
        REFERENCES Faculty(id) ON DELETE CASCADE,
    CONSTRAINT chk_regulation_max_absence CHECK (max_absence >= 0),
    CONSTRAINT chk_regulation_grades_range CHECK (
        min_grade_excellent >= 0 AND min_grade_excellent <= 100 AND
        min_grade_very_good >= 0 AND min_grade_very_good <= 100 AND
        min_grade_good >= 0 AND min_grade_good <= 100 AND
        min_grade_acceptable >= 0 AND min_grade_acceptable <= 100 AND
        min_grade_very_weak >= 0 AND min_grade_very_weak <= 100
    ),
    CONSTRAINT chk_regulation_grades_hierarchy CHECK (
        min_grade_excellent > min_grade_very_good AND
        min_grade_very_good > min_grade_good AND
        min_grade_good > min_grade_acceptable AND
        min_grade_acceptable > min_grade_very_weak
    )
);

CREATE INDEX idx_regulation_faculty ON Regulation(faculty_id);

-- ============================================================================================================
-- MERCY RULE
-- ============================================================================================================

CREATE TABLE MercyRule (
    id SERIAL PRIMARY KEY,
    regulation_id INT NOT NULL,
    original_score NUMERIC(5,2) NOT NULL,
    adjusted_score NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_mercyrule_regulation FOREIGN KEY (regulation_id) 
        REFERENCES Regulation(id) ON DELETE CASCADE,
    CONSTRAINT chk_mercyrule_scores_range CHECK (
        original_score >= 0 AND original_score <= 100 AND
        adjusted_score >= 0 AND adjusted_score <= 100
    ),
    CONSTRAINT chk_mercyrule_adjustment CHECK (adjusted_score >= original_score)
);

CREATE INDEX idx_mercyrule_regulation ON MercyRule(regulation_id);

-- ============================================================================================================
-- SEMESTER
-- ============================================================================================================

CREATE TYPE semester_type AS ENUM ('Fall', 'Spring', 'Summer', 'Winter');

CREATE TABLE Semester (
    id SERIAL PRIMARY KEY,
    year SMALLINT NOT NULL,
    number SMALLINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type semester_type NOT NULL,
    
    CONSTRAINT uq_semester_year_number UNIQUE (year, number),
    CONSTRAINT chk_semester_year CHECK (year >= 1900 AND year <= 2100),
    CONSTRAINT chk_semester_number CHECK (number >= 1 AND number <= 4),
    CONSTRAINT chk_semester_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_semester_year ON Semester(year);


-- ============================================================================================================
-- PROGRAM LEVEL
-- ============================================================================================================

CREATE TABLE ProgramLevel (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL,
    level SMALLINT NOT NULL,
    min_credits SMALLINT NOT NULL DEFAULT 0,
    max_credits SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_programlevel_program FOREIGN KEY (program_id) 
        REFERENCES Program(id) ON DELETE CASCADE,
    CONSTRAINT uq_programlevel_program_level UNIQUE (program_id, level),
    CONSTRAINT chk_programlevel_level CHECK (level > 0),
    CONSTRAINT chk_programlevel_credits CHECK (max_credits >= min_credits AND min_credits >= 0)
);

CREATE INDEX idx_programlevel_program ON ProgramLevel(program_id);

-- ============================================================================================================
-- FEE
-- ============================================================================================================

CREATE TYPE fee_type AS ENUM ('ConstantYear', 'ConstantSemester', 'PerCreditHour', 'PerCourse', 'Administrative', 'Other');

CREATE TABLE Fee (
    id SERIAL PRIMARY KEY,
    program_level_id INT NOT NULL,
    semester_id INT,
    fee_type fee_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_fee_programlevel FOREIGN KEY (program_level_id) 
        REFERENCES ProgramLevel(id) ON DELETE CASCADE,
    CONSTRAINT fk_fee_semester FOREIGN KEY (semester_id) 
        REFERENCES Semester(id) ON DELETE SET NULL,
    CONSTRAINT chk_fee_amount CHECK (amount >= 0)
);

CREATE INDEX idx_fee_programlevel ON Fee(program_level_id);
CREATE INDEX idx_fee_semester ON Fee(semester_id);
CREATE INDEX idx_fee_type ON Fee(fee_type);

-- ============================================================================================================
-- PROGRAM TRANSCRIPT DEFINITION
-- ============================================================================================================

CREATE TABLE ProgramTranscriptDefinition (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL,
    grade_letter VARCHAR(10) NOT NULL,
    min_score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    equivalent_estimate VARCHAR(20),
    min_gpa NUMERIC(5,4) NOT NULL,
    max_gpa NUMERIC(5,4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_programtranscript_program FOREIGN KEY (program_id) 
        REFERENCES Program(id) ON DELETE CASCADE,
    CONSTRAINT uq_programtranscript_grade UNIQUE (program_id, grade_letter),
    CONSTRAINT chk_programtranscript_score CHECK (max_score > min_score AND min_score >= 0 AND max_score <= 100),
    CONSTRAINT chk_programtranscript_gpa CHECK (max_gpa > min_gpa AND min_gpa >= 0 AND max_gpa <= 4.0)
);

CREATE INDEX idx_programtranscript_program ON ProgramTranscriptDefinition(program_id);

-- ============================================================================================================
-- ACADEMIC LOAD SEMESTER
-- ============================================================================================================

CREATE TABLE AcademicLoadSemester (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL,
    semester_id INT NOT NULL,
    program_level_id INT NOT NULL,
    min_credits SMALLINT NOT NULL,
    max_credits SMALLINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_academicloadsemester_program FOREIGN KEY (program_id) 
        REFERENCES Program(id) ON DELETE CASCADE,
    CONSTRAINT fk_academicloadsemester_semester FOREIGN KEY (semester_id) 
        REFERENCES Semester(id) ON DELETE CASCADE,
    CONSTRAINT fk_academicloadsemester_programlevel FOREIGN KEY (program_level_id) 
        REFERENCES ProgramLevel(id) ON DELETE CASCADE,
    CONSTRAINT uq_academicloadsemester UNIQUE (program_id, semester_id, program_level_id),
    CONSTRAINT chk_academicloadsemester_credits CHECK (max_credits >= min_credits AND min_credits >= 0)
);

CREATE INDEX idx_academicloadsemester_program ON AcademicLoadSemester(program_id);
CREATE INDEX idx_academicloadsemester_semester ON AcademicLoadSemester(semester_id);

-- ============================================================================================================
-- ACADEMIC LOAD GPA
-- ============================================================================================================

CREATE TABLE AcademicLoadGPA (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL,
    min_gpa NUMERIC(5,4) NOT NULL,
    max_gpa NUMERIC(5,4) NOT NULL,
    min_credits SMALLINT NOT NULL,
    max_credits SMALLINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_academicloadgpa_program FOREIGN KEY (program_id) 
        REFERENCES Program(id) ON DELETE CASCADE,
    CONSTRAINT chk_academicloadgpa_gpa CHECK (max_gpa >= min_gpa AND min_gpa >= 0 AND max_gpa <= 4.0),
    CONSTRAINT chk_academicloadgpa_credits CHECK (max_credits >= min_credits AND min_credits >= 0)
);

CREATE INDEX idx_academicloadgpa_program ON AcademicLoadGPA(program_id);

-- ============================================================================================================
-- COURSE
-- ============================================================================================================

CREATE TABLE Course (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    credits SMALLINT NOT NULL,
    syllabus TEXT,
    success_percentage NUMERIC(5,2),
    total_fail BOOLEAN NOT NULL DEFAULT false,
    min_final_success_percentage NUMERIC(5,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_course_code UNIQUE (code),
    CONSTRAINT chk_course_credits CHECK (credits > 0),
    CONSTRAINT chk_course_success_percentage CHECK (success_percentage IS NULL OR (success_percentage >= 0 AND success_percentage <= 100)),
    CONSTRAINT chk_course_min_final_success CHECK (min_final_success_percentage IS NULL OR (min_final_success_percentage >= 0 AND min_final_success_percentage <= 100))
);

CREATE INDEX idx_course_code ON Course(code);

-- ============================================================================================================
-- CLASSROOM
-- ============================================================================================================

CREATE TYPE classroom_type AS ENUM ('Lecture', 'Lab' , 'Auditorium', 'Other');

CREATE TABLE Classroom (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    building VARCHAR(100) NOT NULL,
    capacity SMALLINT NOT NULL,
    type classroom_type NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT uq_classroom_room_building UNIQUE (room_number, building),
    CONSTRAINT chk_classroom_capacity CHECK (capacity > 0)
);

CREATE INDEX idx_classroom_building ON Classroom(building);
CREATE INDEX idx_classroom_available ON Classroom(is_available) WHERE is_available = true;

-- ============================================================================================================
-- ROOM
-- ============================================================================================================

CREATE TABLE Room (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    max_members INT,
    access_code VARCHAR(50),
    allow_student_posts BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_room_creator FOREIGN KEY (created_by) 
        REFERENCES "User"(id) ON DELETE RESTRICT,
    CONSTRAINT chk_room_max_members CHECK (max_members IS NULL OR max_members > 0)
);

CREATE INDEX idx_room_creator ON Room(created_by);
CREATE INDEX idx_room_access_code ON Room(access_code) WHERE access_code IS NOT NULL;

-- ============================================================================================================
-- CLASS SESSION
-- ============================================================================================================

CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

CREATE TABLE ClassSession (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    teacher_id INT NOT NULL,
    program_id INT NOT NULL,
    classroom_id INT NOT NULL,
    semester_id INT NOT NULL,
    room_id INT NOT NULL,
    academic_level SMALLINT NOT NULL,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    CONSTRAINT fk_classsession_course FOREIGN KEY (course_id) 
        REFERENCES Course(id) ON DELETE CASCADE,
    CONSTRAINT fk_classsession_teacher FOREIGN KEY (teacher_id) 
        REFERENCES Staff(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_classsession_program FOREIGN KEY (program_id) 
        REFERENCES Program(id) ON DELETE CASCADE,
    CONSTRAINT fk_classsession_classroom FOREIGN KEY (classroom_id) 
        REFERENCES Classroom(id) ON DELETE RESTRICT,
    CONSTRAINT fk_classsession_semester FOREIGN KEY (semester_id) 
        REFERENCES Semester(id) ON DELETE CASCADE,
    CONSTRAINT fk_classsession_room FOREIGN KEY (room_id) 
        REFERENCES Room(id) ON DELETE RESTRICT,
    CONSTRAINT chk_classsession_academic_level CHECK (academic_level > 0),
    CONSTRAINT chk_classsession_time CHECK (end_time > start_time)
);

CREATE INDEX idx_classsession_course ON ClassSession(course_id);
CREATE INDEX idx_classsession_teacher ON ClassSession(teacher_id);
CREATE INDEX idx_classsession_program ON ClassSession(program_id);
CREATE INDEX idx_classsession_semester ON ClassSession(semester_id);
CREATE INDEX idx_classsession_schedule ON ClassSession(day_of_week, start_time);

-- ============================================================================================================
-- COURSE ASSESSMENT
-- ============================================================================================================

CREATE TYPE course_assessment_type AS ENUM('Quiz', 'Assignment' ,'Midterm' , 'Final' , 'Project');

CREATE TABLE CourseAssessment (
    id SERIAL PRIMARY KEY,
    class_session_id INT NOT NULL,
    label VARCHAR(100) NOT NULL,
    assessment_type course_assessment_type NOT NULL,
    marks NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_courseassessment_classsession
        FOREIGN KEY (class_session_id) REFERENCES ClassSession(id) ON DELETE CASCADE,
    CONSTRAINT chk_courseassessment_marks CHECK (marks >= 0)
);

CREATE INDEX idx_courseassessment_classsession ON CourseAssessment(class_session_id);
CREATE INDEX idx_courseassessment_type ON CourseAssessment(assessment_type);

-- ============================================================================================================
-- PROGRAM COURSE
-- ============================================================================================================

CREATE TYPE course_type AS ENUM ('Mandatory', 'Elective', 'Project');

CREATE TABLE ProgramCourse (
    program_id INT NOT NULL,
    course_id INT NOT NULL,
    type course_type NOT NULL,
    
    PRIMARY KEY (program_id, course_id),
    CONSTRAINT fk_programcourse_program FOREIGN KEY (program_id) 
        REFERENCES Program(id) ON DELETE CASCADE,
    CONSTRAINT fk_programcourse_course FOREIGN KEY (course_id) 
        REFERENCES Course(id) ON DELETE CASCADE
);

CREATE INDEX idx_programcourse_course ON ProgramCourse(course_id);
CREATE INDEX idx_programcourse_course_type ON ProgramCourse(type);

-- ============================================================================================================
-- COURSE PREREQUISITE
-- ============================================================================================================

CREATE TABLE CoursePrerequisite (
    course_id INT NOT NULL,
    prerequisite_id INT NOT NULL,
    
    PRIMARY KEY (course_id, prerequisite_id),
    CONSTRAINT fk_courseprerequisite_course FOREIGN KEY (course_id) 
        REFERENCES Course(id) ON DELETE CASCADE,
    CONSTRAINT fk_courseprerequisite_prerequisite FOREIGN KEY (prerequisite_id) 
        REFERENCES Course(id) ON DELETE CASCADE,
    CONSTRAINT chk_courseprerequisite_self CHECK (course_id != prerequisite_id)
);

CREATE INDEX idx_courseprerequisite_prerequisite ON CoursePrerequisite(prerequisite_id);

-- ============================================================================================================
-- STUDENT FEE REPORT
-- ============================================================================================================

CREATE TYPE fee_status AS ENUM ('Pending', 'Paid');

CREATE TABLE StudentFeeReport (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    program_level_id INT NOT NULL,
    semester_id INT NOT NULL,
    fee_id INT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    status fee_status NOT NULL DEFAULT 'Pending',
    generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_studentfeereport_student FOREIGN KEY (student_id) 
        REFERENCES Student(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_studentfeereport_programlevel FOREIGN KEY (program_level_id) 
        REFERENCES ProgramLevel(id) ON DELETE RESTRICT,
    CONSTRAINT fk_studentfeereport_semester FOREIGN KEY (semester_id) 
        REFERENCES Semester(id) ON DELETE RESTRICT,
    CONSTRAINT fk_studentfeereport_fee FOREIGN KEY (fee_id) 
        REFERENCES Fee(id) ON DELETE RESTRICT,
    CONSTRAINT chk_studentfeereport_amount CHECK (amount >= 0)
);

CREATE INDEX idx_studentfeereport_student ON StudentFeeReport(student_id);
CREATE INDEX idx_studentfeereport_semester ON StudentFeeReport(semester_id);
CREATE INDEX idx_studentfeereport_status ON StudentFeeReport(status);

-- ============================================================================================================
-- ROLE
-- ============================================================================================================

CREATE TABLE Role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_role_name UNIQUE (name)
);

CREATE INDEX idx_role_name ON Role(name);

-- ============================================================================================================
-- PERMISSION
-- ============================================================================================================

CREATE TABLE Permission (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_permission_name UNIQUE (name)
);

CREATE INDEX idx_permission_name ON Permission(name);

-- ============================================================================================================
-- USER ROLE
-- ============================================================================================================

CREATE TABLE UserRole (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_userrole_user FOREIGN KEY (user_id) 
        REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT fk_userrole_role FOREIGN KEY (role_id) 
        REFERENCES Role(id) ON DELETE CASCADE
);

CREATE INDEX idx_userrole_role ON UserRole(role_id);

-- ============================================================================================================
-- ROLE PERMISSION
-- ============================================================================================================

CREATE TABLE RolePermission (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rolepermission_role FOREIGN KEY (role_id) 
        REFERENCES Role(id) ON DELETE CASCADE,
    CONSTRAINT fk_rolepermission_permission FOREIGN KEY (permission_id) 
        REFERENCES Permission(id) ON DELETE CASCADE
);

CREATE INDEX idx_rolepermission_permission ON RolePermission(permission_id);

-- ============================================================================================================
-- COURSE REGISTRATION
-- ============================================================================================================

CREATE TYPE registration_status AS ENUM ('Enrolled', 'Withdrawn', 'Completed', 'Failed', 'InProgress');
CREATE TYPE grade_enum AS ENUM (
    'A+', 'A', 'A-', 
    'B+', 'B', 'B-', 
    'C+', 'C', 'C-', 
    'D+', 'D', 'F'
);

CREATE TABLE CourseRegistration (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    session_id INT NOT NULL,
    semester_id INT NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status registration_status NOT NULL DEFAULT 'Enrolled',
    grade grade_enum,
    grade_points NUMERIC(5,4),
    
    CONSTRAINT fk_courseregistration_student FOREIGN KEY (student_id) 
        REFERENCES Student(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_courseregistration_session FOREIGN KEY (session_id) 
        REFERENCES ClassSession(id) ON DELETE RESTRICT,
    CONSTRAINT fk_courseregistration_semester FOREIGN KEY (semester_id) 
        REFERENCES Semester(id) ON DELETE RESTRICT,
    CONSTRAINT uq_courseregistration_student_session UNIQUE (student_id, session_id, semester_id),
    CONSTRAINT chk_courseregistration_grade_points CHECK (grade_points IS NULL OR (grade_points >= 0 AND grade_points <= 4.0))
);

CREATE INDEX idx_courseregistration_student ON CourseRegistration(student_id);
CREATE INDEX idx_courseregistration_session ON CourseRegistration(session_id);
CREATE INDEX idx_courseregistration_semester ON CourseRegistration(semester_id);
CREATE INDEX idx_courseregistration_status ON CourseRegistration(status);

-- ============================================================================================================
-- GRADE
-- ============================================================================================================

CREATE TABLE Grade (
    id SERIAL PRIMARY KEY,
    course_registration_id INT NOT NULL,
    course_assessment_id INT NOT NULL,
    marks NUMERIC(5,2) NOT NULL,
    max_marks NUMERIC(5,2) NOT NULL,
    assessment_date DATE,
    comments TEXT,

    CONSTRAINT fk_grade_courseregistration FOREIGN KEY (course_registration_id)
        REFERENCES CourseRegistration(id) ON DELETE CASCADE,

    CONSTRAINT fk_grade_courseassessment FOREIGN KEY (course_assessment_id)
        REFERENCES CourseAssessment(id) ON DELETE CASCADE,

    CONSTRAINT chk_grade_marks CHECK (marks >= 0 AND marks <= max_marks),
    CONSTRAINT chk_grade_max_marks CHECK (max_marks > 0),
    CONSTRAINT chk_grade_assessment_date CHECK (assessment_date IS NULL OR assessment_date <= CURRENT_DATE)
);

CREATE INDEX idx_grade_courseregistration ON Grade(course_registration_id);
CREATE INDEX idx_grade_courseassessment ON Grade(course_assessment_id);

-- ============================================================================================================
-- TRANSCRIPT
-- ============================================================================================================

CREATE TABLE Transcript (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    year SMALLINT NOT NULL,
    semester_gpa NUMERIC(5,4) NOT NULL,
    cumulative_gpa NUMERIC(5,4) NOT NULL,
    total_credits SMALLINT NOT NULL DEFAULT 0,
    generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    CONSTRAINT fk_transcript_student FOREIGN KEY (student_id) 
        REFERENCES Student(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_transcript_semester FOREIGN KEY (semester_id) 
        REFERENCES Semester(id) ON DELETE RESTRICT,
    CONSTRAINT uq_transcript_student_semester UNIQUE (student_id, semester_id),
    CONSTRAINT chk_transcript_semester_gpa CHECK (semester_gpa >= 0 AND semester_gpa <= 4.0),
    CONSTRAINT chk_transcript_cumulative_gpa CHECK (cumulative_gpa >= 0 AND cumulative_gpa <= 4.0),
    CONSTRAINT chk_transcript_total_credits CHECK (total_credits >= 0),
    CONSTRAINT chk_transcript_year CHECK (year >= 1900 AND year <= 2100)
);

CREATE INDEX idx_transcript_student ON Transcript(student_id);
CREATE INDEX idx_transcript_semester ON Transcript(semester_id);
CREATE INDEX idx_transcript_year ON Transcript(year DESC);

-- ============================================================================================================
-- ATTENDANCE SESSION
-- ============================================================================================================

CREATE TYPE attendance_mode AS ENUM ('Manual', 'QRCode', 'Biometric', 'Geofencing', 'Hotspot', 'Online');

CREATE TABLE AttendanceSession (
    id SERIAL PRIMARY KEY,
    class_session_id INT NOT NULL,
    faculty_member_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    attendance_mode attendance_mode NOT NULL,
    hotspot_ssid VARCHAR(255),
    qr_code VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_notes TEXT,
    
    CONSTRAINT fk_attendancesession_classsession FOREIGN KEY (class_session_id) 
        REFERENCES ClassSession(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendancesession_facultymember FOREIGN KEY (faculty_member_id) 
        REFERENCES Staff(user_id) ON DELETE RESTRICT,
    CONSTRAINT chk_attendancesession_time CHECK (end_time > start_time),
    CONSTRAINT chk_attendancesession_date CHECK (session_date <= CURRENT_DATE)
);

CREATE INDEX idx_attendancesession_classsession ON AttendanceSession(class_session_id);
CREATE INDEX idx_attendancesession_date ON AttendanceSession(session_date DESC);
CREATE INDEX idx_attendancesession_faculty ON AttendanceSession(faculty_member_id);
CREATE INDEX idx_attendancesession_active ON AttendanceSession(is_active) WHERE is_active = true;

-- ============================================================================================================
-- STUDENT ATTENDANCE
-- ============================================================================================================

CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Late', 'Excused', 'Medical');

CREATE TABLE StudentAttendance (
    id SERIAL PRIMARY KEY,
    attendance_session_id INT NOT NULL,
    student_id INT NOT NULL,
    status attendance_status NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    device_ip INET,
    device_mac MACADDR,
    notes TEXT,
    is_offline_sync BOOLEAN NOT NULL DEFAULT false,
    synced_at TIMESTAMP,
    
    CONSTRAINT fk_studentattendance_session FOREIGN KEY (attendance_session_id) 
        REFERENCES AttendanceSession(id) ON DELETE CASCADE,
    CONSTRAINT fk_studentattendance_student FOREIGN KEY (student_id) 
        REFERENCES Student(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_studentattendance_session_student UNIQUE (attendance_session_id, student_id),
    CONSTRAINT chk_studentattendance_sync CHECK (
        (is_offline_sync = false AND synced_at IS NULL) OR
        (is_offline_sync = true)
    )
);

CREATE INDEX idx_studentattendance_session ON StudentAttendance(attendance_session_id);
CREATE INDEX idx_studentattendance_student ON StudentAttendance(student_id);
CREATE INDEX idx_studentattendance_status ON StudentAttendance(status);
CREATE INDEX idx_studentattendance_recorded ON StudentAttendance(recorded_at DESC);

-- ============================================================================================================
-- ATTENDANCE REPORT
-- ============================================================================================================

CREATE TABLE AttendanceReport (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    total_sessions SMALLINT NOT NULL DEFAULT 0,
    attended_sessions SMALLINT NOT NULL DEFAULT 0,
    attendance_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_sessions > 0 THEN (attended_sessions::NUMERIC / total_sessions * 100)
            ELSE 0 
        END
    ) STORED,
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_attendancereport_course FOREIGN KEY (course_id) 
        REFERENCES Course(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendancereport_student FOREIGN KEY (student_id) 
        REFERENCES Student(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_attendancereport_course_student_period UNIQUE (course_id, student_id, report_period_start, report_period_end),
    CONSTRAINT chk_attendancereport_sessions CHECK (attended_sessions <= total_sessions AND total_sessions >= 0),
    CONSTRAINT chk_attendancereport_period CHECK (report_period_end >= report_period_start)
);

CREATE INDEX idx_attendancereport_course ON AttendanceReport(course_id);
CREATE INDEX idx_attendancereport_student ON AttendanceReport(student_id);
CREATE INDEX idx_attendancereport_period ON AttendanceReport(report_period_start, report_period_end);

-- ============================================================================================================
-- ROOM MEMBER
-- ============================================================================================================

CREATE TYPE room_role AS ENUM ('Owner', 'Member');

CREATE TABLE RoomMember (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    role room_role NOT NULL DEFAULT 'Member',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_roommember_room FOREIGN KEY (room_id) 
        REFERENCES Room(id) ON DELETE CASCADE,
    CONSTRAINT fk_roommember_user FOREIGN KEY (user_id) 
        REFERENCES "User"(id) ON DELETE CASCADE,
    CONSTRAINT uq_roommember_room_user UNIQUE (room_id, user_id)
);

CREATE INDEX idx_roommember_room ON RoomMember(room_id);
CREATE INDEX idx_roommember_user ON RoomMember(user_id);

-- ============================================================================================================
-- ROOM POST
-- ============================================================================================================

CREATE TYPE post_type AS ENUM ('ANNOUNCEMENT', 'ASSIGNMENT', 'MATERIAL');

CREATE TABLE RoomPost (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT,
    post_type post_type NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    due_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_roompost_room FOREIGN KEY (room_id) 
        REFERENCES Room(id) ON DELETE CASCADE,
    CONSTRAINT fk_roompost_author FOREIGN KEY (author_id) 
        REFERENCES "User"(id) ON DELETE RESTRICT,
    CONSTRAINT chk_roompost_due_date CHECK (due_date IS NULL OR due_date > created_at)
);

CREATE INDEX idx_roompost_room ON RoomPost(room_id);
CREATE INDEX idx_roompost_author ON RoomPost(author_id);
CREATE INDEX idx_roompost_created ON RoomPost(created_at DESC);
CREATE INDEX idx_roompost_pinned ON RoomPost(room_id, is_pinned) WHERE is_pinned = true;

-- ============================================================================================================
-- ROOM POST ATTACHMENT
-- ============================================================================================================

CREATE TYPE storage_provider AS ENUM ('LOCAL', 'S3', 'Azure Blob Storage', 'Google Cloud Storage');

CREATE TABLE RoomPostAttachment (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    storage_provider storage_provider NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_roompostattachment_post FOREIGN KEY (post_id) 
        REFERENCES RoomPost(id) ON DELETE CASCADE,
    CONSTRAINT chk_roompostattachment_file_size CHECK (file_size IS NULL OR file_size > 0)
);

CREATE INDEX idx_roompostattachment_post ON RoomPostAttachment(post_id);

-- ============================================================================================================
-- ROOM POST COMMENT
-- ============================================================================================================

CREATE TABLE RoomPostComment (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_roompostcomment_post FOREIGN KEY (post_id) 
        REFERENCES RoomPost(id) ON DELETE CASCADE,
    CONSTRAINT fk_roompostcomment_author FOREIGN KEY (author_id) 
        REFERENCES "User"(id) ON DELETE RESTRICT,
    CONSTRAINT chk_roompostcomment_content_length CHECK (char_length(content) > 0)
);

CREATE INDEX idx_roompostcomment_post ON RoomPostComment(post_id);
CREATE INDEX idx_roompostcomment_author ON RoomPostComment(author_id);
CREATE INDEX idx_roompostcomment_created ON RoomPostComment(created_at DESC);
