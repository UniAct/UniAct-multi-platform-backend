#!/usr/bin/env ts-node
/**
 * ============================================================================
 *  Comprehensive Prisma Seed Script for Multi-Tenant University Schema
 * ============================================================================
 *
 *  Usage:
 *      ts-node seeding.ts <schema_name>
 *
 *  Example:
 *      ts-node seeding.ts alex_university
 *
 *  Requirements:
 *      - bcrypt installed                         (npm i bcrypt + @types/bcrypt)
 *      - @prisma/client generated                 (npx prisma generate)
 *      - @prisma/adapter-pg installed             (already in your project)
 *      - The target schema must already exist     (cloned from "template")
 *      - DATABASE_URL must be set in your .env
 *
 *  NOTE:
 *      Adjust the import path of `GetTenantClient` below to match your
 *      project structure. In this example it is assumed to live next to
 *      this file as `./TenantClient`.
 *
 *  ----------------------------------------------------------------------------
 *  IMPORTANT — No hardcoded IDs
 *  ----------------------------------------------------------------------------
 *  All tables use `@id @default(autoincrement())`. This script does NOT
 *  pass explicit `id` values. Instead, after each bulk insert it fetches
 *  the generated IDs back via `findMany` on natural keys (username, name,
 *  code, etc.) and stores them in a `SeedContext` for use in subsequent
 *  FK references.
 *
 *  This makes the script:
 *    - Safe to run on schemas that already have data
 *    - Independent of sequence state
 *    - Truly idempotent (skipDuplicates handles conflicts)
 *
 *  ----------------------------------------------------------------------------
 *  DEFAULT PASSWORDS (plaintext — each user record also has a comment above it)
 *  ----------------------------------------------------------------------------
 *      Root:          Root@2025     (username: root)
 *      Admin:         Admin@2025    (username: admin)
 *      Dean:          Dean@2025
 *      Program Head:  Head@2025
 *      Teacher:       Teacher@2025
 *      Student:       Student@2025
 *  ----------------------------------------------------------------------------
 *
 *  ROLES & PERMISSIONS:
 *      - 6 Roles: Root, Admin, Dean, ProgramHead, Teacher, Student
 *      - 33 Permissions grouped by resource (role / account / faculty / program /
 *        course / courseAssessment / semester / classroom / schedule)
 *      - Root and Admin have every permission.
 *      - Two tenant-level administrator accounts are seeded:
 *          • username "root"  → Root role
 *          • username "admin" → Admin role
 *        These have no Staff/Student record — they exist purely as
 *        privileged User accounts for tenant administration.
 *
 *  Data Volume (approximate):
 *      - 4 Faculties
 *      - 12 Programs (3 per faculty)
 *      - 2 Admin accounts (Root + Admin)
 *      - 40 Staff users (4 deans + 12 program heads + 24 teachers)
 *      - 120 Student users (10 per program)
 *      - 48 Program Levels (4 per program)
 *      - 11 Semesters (Fall 2022 → Spring 2026; current = Spring 2026 ending July 5, 2026)
 *      - 96 Courses (8 per program, distributed across levels)
 *      - 10 Classrooms
 *      - 4 Regulations + Mercy Rules
 *      - Program Transcript Definitions, Academic Loads, Fees
 *      - Schedule Slots + Contexts (current semester — every course has an assigned teacher)
 *      - Course Assessments, Registrations, Grades, Transcripts
 *      - Attendance Sessions + Records
 *      - Learning Groups + Posts + Comments
 *      - Announcements
 * ============================================================================
 */


import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { GetTenantClient } from "./Utils/prismaClient";
import dotenv from 'dotenv';
dotenv.config();

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type DbClient = PrismaClient;

const BCRYPT_ROUNDS = 10;

const PWD_ROOT    = "Root@2025";
const PWD_ADMIN   = "Admin@2025";
const PWD_DEAN    = "Dean@2025";
const PWD_HEAD    = "Head@2025";
const PWD_TEACHER = "Teacher@2025";
const PWD_STUDENT = "Student@2025";

const NOW = new Date();

const date = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const time = (h: number, m: number) => new Date(1970, 0, 1, h, m, 0, 0);

// University ID in the `public` schema — adjust if your tenant uses a different one.
const UNIVERSITY_ID = 1;

// Semester year/term constants — used to look up generated semester IDs.
const CURRENT_SEMESTER_YEAR = 2026;
const CURRENT_SEMESTER_TERM = 2; // Spring
const PAST_SEMESTER_YEAR    = 2025;
const PAST_SEMESTER_TERM    = 1; // Fall

// ============================================================================
// SEED CONTEXT — accumulates generated IDs for FK references
// ============================================================================

interface SeedContext {
  // Roles & permissions (by name)
  roleNameToId: Map<string, number>;
  permNameToId: Map<string, number>;

  // Users (by username)
  usernameToUserId: Map<string, number>;
  rootUserId: number;
  adminUserId: number;

  // Staff user IDs (ordered — parallel to STAFF_USERS array)
  // Indices 0-3: deans, 4-15: program heads, 16-39: teachers
  staffUserIds: number[];

  // Students (with program/level info for registrations)
  students: Array<{
    userId: number;
    programId: number;
    level: number;
    programLevelId: number;
    cgpa: number;
  }>;

  // Academic structure
  facultyNameToId: Map<string, number>;
  programNameToId: Map<string, number>;
  programLevelIdByKey: Map<string, number>; // `${programId}:${level}` → id
  courseCodeToId: Map<string, number>;
  regulationIdByFacultyId: Map<number, number>;

  // Semesters
  currentSemesterId: number;
  pastSemesterId: number;

  // Infrastructure
  classroomIdByKey: Map<string, number>; // `${classroomNumber}:${building}`

  // Schedule (current semester) — stores all slot info for easy lookup
  slots: Array<{
    slotId: number;
    contextId: number;
    courseId: number;
    programId: number;
    academicLevel: number;
    teacherId: number;
  }>;

  // Fees (for StudentFeeReport lookups)
  feeIdByKey: Map<string, number>; // `${programLevelId}:${semNum}`
}

function newSeedContext(): SeedContext {
  return {
    roleNameToId: new Map(),
    permNameToId: new Map(),
    usernameToUserId: new Map(),
    rootUserId: 0,
    adminUserId: 0,
    staffUserIds: [],
    students: [],
    facultyNameToId: new Map(),
    programNameToId: new Map(),
    programLevelIdByKey: new Map(),
    courseCodeToId: new Map(),
    regulationIdByFacultyId: new Map(),
    currentSemesterId: 0,
    pastSemesterId: 0,
    classroomIdByKey: new Map(),
    slots: [],
    feeIdByKey: new Map(),
  };
}

// ============================================================================
// DATA DEFINITIONS (no explicit IDs — DB auto-assigns them)
// ============================================================================

interface FacultyDef {
  name: string;
  description: string;
  dean: {
    firstName: string;
    lastName: string;
    phone: string;
    dob: Date;
    address: string;
    city: string;
    nationalId: string;
  };
  regulation: {
    name: string;
    maxAbsence: number;
    excellent: number;
    veryGood: number;
    good: number;
    acceptable: number;
    veryWeak: number;
  };
}

const FACULTIES: FacultyDef[] = [
  {
    name: "Faculty of Computer Science & AI",
    description: "Programs in computer science, AI, cyber security and software engineering.",
    dean: { firstName: "Fathy",  lastName: "Mansour",   phone: "01211129394", dob: date(1975, 6, 12), address: "132 Sidi Gaber, Alexandria", city: "Alexandria", nationalId: "27510202597572" },
    regulation: { name: "CS & AI Regulation 2022", maxAbsence: 6, excellent: 90, veryGood: 80, good: 70, acceptable: 60, veryWeak: 50 },
  },
  {
    name: "Faculty of Engineering",
    description: "Civil, Mechanical, and Electrical engineering programs.",
    dean: { firstName: "Ramy",    lastName: "Barakat",   phone: "01141224189", dob: date(1965, 11, 4), address: "68 El Manshia, Alexandria",  city: "Alexandria", nationalId: "26505021608796" },
    regulation: { name: "Engineering Regulation 2022", maxAbsence: 8, excellent: 90, veryGood: 80, good: 65, acceptable: 55, veryWeak: 50 },
  },
  {
    name: "Faculty of Science",
    description: "Pure and applied sciences: Physics, Chemistry, Mathematics.",
    dean: { firstName: "Mona",    lastName: "Abdel-Rahman", phone: "01099887766", dob: date(1970, 3, 22), address: "5 Smouha, Alexandria",       city: "Alexandria", nationalId: "27003214569871" },
    regulation: { name: "Science Regulation 2022", maxAbsence: 7, excellent: 90, veryGood: 80, good: 70, acceptable: 60, veryWeak: 50 },
  },
  {
    name: "Faculty of Business Administration",
    description: "Business, Accounting, and Marketing programs.",
    dean: { firstName: "Khaled",  lastName: "Seif",       phone: "01555667788", dob: date(1968, 7, 9),  address: "22 Camp Caesar, Alexandria", city: "Alexandria", nationalId: "26807123456789" },
    regulation: { name: "Business Regulation 2022", maxAbsence: 5, excellent: 90, veryGood: 80, good: 70, acceptable: 60, veryWeak: 50 },
  },
];

interface ProgramDef {
  name: string;
  description: string;
  phone: string;
  universityCreditHours: number;
  facultyCreditHours: number;
  programCreditHours: number;
  durationYears: number;
  programType: "Bachelor" | "Master";
  courses: Array<{ code: string; name: string; credits: number; level: number; type: "Mandatory" | "Elective" | "Project" }>;
}

const PROGRAMS_BY_FACULTY: ProgramDef[][] = [
  // Faculty 1 — CS & AI
  [
    {
      name: "Cyber Security", description: "Bachelor of Cyber Security — 4-year program.",
      phone: "02-4001", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 100, durationYears: 4, programType: "Bachelor",
      courses: [
        { code: "CS101", name: "Introduction to Cyber Security", credits: 3, level: 1, type: "Mandatory" },
        { code: "CS102", name: "Programming Fundamentals",       credits: 4, level: 1, type: "Mandatory" },
        { code: "CS201", name: "Network Security",               credits: 3, level: 2, type: "Mandatory" },
        { code: "CS202", name: "Cryptography",                   credits: 3, level: 2, type: "Mandatory" },
        { code: "CS301", name: "Ethical Hacking",                credits: 4, level: 3, type: "Mandatory" },
        { code: "CS302", name: "Digital Forensics",              credits: 3, level: 3, type: "Elective"  },
        { code: "CS401", name: "Secure Software Development",    credits: 3, level: 4, type: "Mandatory" },
        { code: "CS402", name: "Capstone Security Project",      credits: 4, level: 4, type: "Project"   },
      ],
    },
    {
      name: "Intelligent Systems", description: "Bachelor of Intelligent Systems — 4-year program.",
      phone: "02-4002", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 100, durationYears: 4, programType: "Bachelor",
      courses: [
        { code: "IS101", name: "Introduction to AI",             credits: 3, level: 1, type: "Mandatory" },
        { code: "IS102", name: "Discrete Mathematics",           credits: 3, level: 1, type: "Mandatory" },
        { code: "IS201", name: "Machine Learning",               credits: 4, level: 2, type: "Mandatory" },
        { code: "IS202", name: "Data Structures",                credits: 3, level: 2, type: "Mandatory" },
        { code: "IS301", name: "Deep Learning",                  credits: 4, level: 3, type: "Mandatory" },
        { code: "IS302", name: "Computer Vision",                credits: 3, level: 3, type: "Elective"  },
        { code: "IS401", name: "Natural Language Processing",    credits: 3, level: 4, type: "Mandatory" },
        { code: "IS402", name: "Capstone AI Project",            credits: 4, level: 4, type: "Project"   },
      ],
    },
    {
      name: "Software Engineering", description: "Bachelor of Software Engineering — 4-year program.",
      phone: "02-4003", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 100, durationYears: 4, programType: "Bachelor",
      courses: [
        { code: "SE101", name: "Introduction to Software Engineering", credits: 3, level: 1, type: "Mandatory" },
        { code: "SE102", name: "Object-Oriented Programming",         credits: 4, level: 1, type: "Mandatory" },
        { code: "SE201", name: "Data Structures & Algorithms",        credits: 4, level: 2, type: "Mandatory" },
        { code: "SE202", name: "Database Systems",                    credits: 3, level: 2, type: "Mandatory" },
        { code: "SE301", name: "Software Architecture",               credits: 3, level: 3, type: "Mandatory" },
        { code: "SE302", name: "Web Application Development",         credits: 3, level: 3, type: "Elective"  },
        { code: "SE401", name: "DevOps & Cloud",                      credits: 3, level: 4, type: "Mandatory" },
        { code: "SE402", name: "Capstone Software Project",           credits: 4, level: 4, type: "Project"   },
      ],
    },
  ],
  // Faculty 2 — Engineering
  [
    {
      name: "Civil Engineering", description: "Bachelor of Civil Engineering — 5-year program.",
      phone: "02-4004", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 118, durationYears: 5, programType: "Bachelor",
      courses: [
        { code: "CIV101", name: "Engineering Mechanics",      credits: 3, level: 1, type: "Mandatory" },
        { code: "CIV102", name: "Engineering Drawing",        credits: 2, level: 1, type: "Mandatory" },
        { code: "CIV201", name: "Strength of Materials",      credits: 4, level: 2, type: "Mandatory" },
        { code: "CIV202", name: "Fluid Mechanics",            credits: 3, level: 2, type: "Mandatory" },
        { code: "CIV301", name: "Structural Analysis",        credits: 4, level: 3, type: "Mandatory" },
        { code: "CIV302", name: "Geotechnical Engineering",   credits: 3, level: 3, type: "Elective"  },
        { code: "CIV401", name: "Reinforced Concrete",        credits: 4, level: 4, type: "Mandatory" },
        { code: "CIV402", name: "Capstone Civil Project",     credits: 4, level: 4, type: "Project"   },
      ],
    },
    {
      name: "Mechanical Engineering", description: "Bachelor of Mechanical Engineering — 5-year program.",
      phone: "02-4005", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 118, durationYears: 5, programType: "Bachelor",
      courses: [
        { code: "MEC101", name: "Thermodynamics I",           credits: 3, level: 1, type: "Mandatory" },
        { code: "MEC102", name: "Engineering Materials",      credits: 3, level: 1, type: "Mandatory" },
        { code: "MEC201", name: "Dynamics of Machinery",      credits: 4, level: 2, type: "Mandatory" },
        { code: "MEC202", name: "Fluid Mechanics",            credits: 3, level: 2, type: "Mandatory" },
        { code: "MEC301", name: "Heat Transfer",              credits: 4, level: 3, type: "Mandatory" },
        { code: "MEC302", name: "Manufacturing Processes",    credits: 3, level: 3, type: "Elective"  },
        { code: "MEC401", name: "Mechanical Design",          credits: 4, level: 4, type: "Mandatory" },
        { code: "MEC402", name: "Capstone Mechanical Project",credits: 4, level: 4, type: "Project"   },
      ],
    },
    {
      name: "Electrical Engineering", description: "Bachelor of Electrical Engineering — 5-year program.",
      phone: "02-4006", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 118, durationYears: 5, programType: "Bachelor",
      courses: [
        { code: "EE101", name: "Circuit Analysis I",          credits: 3, level: 1, type: "Mandatory" },
        { code: "EE102", name: "Digital Logic Design",        credits: 3, level: 1, type: "Mandatory" },
        { code: "EE201", name: "Electronics I",               credits: 4, level: 2, type: "Mandatory" },
        { code: "EE202", name: "Signals & Systems",           credits: 3, level: 2, type: "Mandatory" },
        { code: "EE301", name: "Control Systems",             credits: 4, level: 3, type: "Mandatory" },
        { code: "EE302", name: "Power Systems",               credits: 3, level: 3, type: "Elective"  },
        { code: "EE401", name: "Embedded Systems",            credits: 4, level: 4, type: "Mandatory" },
        { code: "EE402", name: "Capstone Electrical Project", credits: 4, level: 4, type: "Project"   },
      ],
    },
  ],
  // Faculty 3 — Science
  [
    {
      name: "Physics", description: "Bachelor of Physics — 4-year program.",
      phone: "02-4007", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 96, durationYears: 4, programType: "Bachelor",
      courses: [
        { code: "PHY101", name: "Classical Mechanics I",   credits: 3, level: 1, type: "Mandatory" },
        { code: "PHY102", name: "General Physics Lab",     credits: 2, level: 1, type: "Mandatory" },
        { code: "PHY201", name: "Electromagnetism",        credits: 4, level: 2, type: "Mandatory" },
        { code: "PHY202", name: "Thermodynamics",          credits: 3, level: 2, type: "Mandatory" },
        { code: "PHY301", name: "Quantum Mechanics",       credits: 4, level: 3, type: "Mandatory" },
        { code: "PHY302", name: "Astrophysics",            credits: 3, level: 3, type: "Elective"  },
        { code: "PHY401", name: "Solid State Physics",     credits: 4, level: 4, type: "Mandatory" },
        { code: "PHY402", name: "Capstone Physics Project",credits: 4, level: 4, type: "Project"   },
      ],
    },
    {
      name: "Chemistry", description: "Bachelor of Chemistry — 4-year program.",
      phone: "02-4008", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 96, durationYears: 4, programType: "Bachelor",
      courses: [
        { code: "CHM101", name: "General Chemistry I",     credits: 3, level: 1, type: "Mandatory" },
        { code: "CHM102", name: "Chemistry Lab I",         credits: 2, level: 1, type: "Mandatory" },
        { code: "CHM201", name: "Organic Chemistry",       credits: 4, level: 2, type: "Mandatory" },
        { code: "CHM202", name: "Inorganic Chemistry",     credits: 3, level: 2, type: "Mandatory" },
        { code: "CHM301", name: "Analytical Chemistry",    credits: 4, level: 3, type: "Mandatory" },
        { code: "CHM302", name: "Biochemistry",            credits: 3, level: 3, type: "Elective"  },
        { code: "CHM401", name: "Physical Chemistry",      credits: 4, level: 4, type: "Mandatory" },
        { code: "CHM402", name: "Capstone Chemistry Project",credits: 4, level: 4, type: "Project" },
      ],
    },
    {
      name: "Mathematics", description: "Bachelor of Mathematics — 4-year program.",
      phone: "02-4009", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 96, durationYears: 4, programType: "Bachelor",
      courses: [
        { code: "MTH101", name: "Calculus I",              credits: 3, level: 1, type: "Mandatory" },
        { code: "MTH102", name: "Linear Algebra",          credits: 3, level: 1, type: "Mandatory" },
        { code: "MTH201", name: "Calculus II",             credits: 4, level: 2, type: "Mandatory" },
        { code: "MTH202", name: "Differential Equations",  credits: 3, level: 2, type: "Mandatory" },
        { code: "MTH301", name: "Real Analysis",           credits: 4, level: 3, type: "Mandatory" },
        { code: "MTH302", name: "Number Theory",           credits: 3, level: 3, type: "Elective"  },
        { code: "MTH401", name: "Abstract Algebra",        credits: 4, level: 4, type: "Mandatory" },
        { code: "MTH402", name: "Capstone Mathematics Project", credits: 4, level: 4, type: "Project" },
      ],
    },
  ],
  // Faculty 4 — Business
  [
    {
      name: "Business Administration", description: "Bachelor of Business Administration — 4-year program.",
      phone: "02-4010", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 96, durationYears: 4, programType: "Bachelor",
      courses: [
        { code: "BUS101", name: "Principles of Management",  credits: 3, level: 1, type: "Mandatory" },
        { code: "BUS102", name: "Microeconomics",            credits: 3, level: 1, type: "Mandatory" },
        { code: "BUS201", name: "Marketing Principles",      credits: 3, level: 2, type: "Mandatory" },
        { code: "BUS202", name: "Financial Accounting",      credits: 3, level: 2, type: "Mandatory" },
        { code: "BUS301", name: "Operations Management",     credits: 3, level: 3, type: "Mandatory" },
        { code: "BUS302", name: "Organizational Behavior",   credits: 3, level: 3, type: "Elective"  },
        { code: "BUS401", name: "Strategic Management",      credits: 3, level: 4, type: "Mandatory" },
        { code: "BUS402", name: "Capstone Business Project", credits: 4, level: 4, type: "Project"   },
      ],
    },
    {
      name: "Accounting", description: "Bachelor of Accounting — 4-year program.",
      phone: "02-4011", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 96, durationYears: 4, programType: "Bachelor",
      courses: [
        { code: "ACC101", name: "Financial Accounting I",   credits: 3, level: 1, type: "Mandatory" },
        { code: "ACC102", name: "Business Mathematics",      credits: 3, level: 1, type: "Mandatory" },
        { code: "ACC201", name: "Managerial Accounting",     credits: 3, level: 2, type: "Mandatory" },
        { code: "ACC202", name: "Cost Accounting",           credits: 3, level: 2, type: "Mandatory" },
        { code: "ACC301", name: "Auditing",                  credits: 3, level: 3, type: "Mandatory" },
        { code: "ACC302", name: "Taxation",                  credits: 3, level: 3, type: "Elective"  },
        { code: "ACC401", name: "Advanced Financial Reporting", credits: 3, level: 4, type: "Mandatory" },
        { code: "ACC402", name: "Capstone Accounting Project",  credits: 4, level: 4, type: "Project"   },
      ],
    },
    {
      name: "Marketing", description: "Bachelor of Marketing — 4-year program.",
      phone: "02-4012", universityCreditHours: 12, facultyCreditHours: 20, programCreditHours: 96, durationYears: 4, programType: "Bachelor",
      courses: [
        { code: "MKT101", name: "Principles of Marketing",   credits: 3, level: 1, type: "Mandatory" },
        { code: "MKT102", name: "Consumer Behavior",         credits: 3, level: 1, type: "Mandatory" },
        { code: "MKT201", name: "Market Research",           credits: 3, level: 2, type: "Mandatory" },
        { code: "MKT202", name: "Advertising & Promotion",   credits: 3, level: 2, type: "Mandatory" },
        { code: "MKT301", name: "Digital Marketing",         credits: 3, level: 3, type: "Mandatory" },
        { code: "MKT302", name: "Brand Management",          credits: 3, level: 3, type: "Elective"  },
        { code: "MKT401", name: "International Marketing",   credits: 3, level: 4, type: "Mandatory" },
        { code: "MKT402", name: "Capstone Marketing Project",credits: 4, level: 4, type: "Project"   },
      ],
    },
  ],
];

// Semesters — no explicit IDs; looked up by (year, term) after insertion.
const SEMESTERS: Array<{
  year: number;
  term: number;
  startDate: Date;
  endDate: Date;
  type: "Fall" | "Spring" | "Summer";
}> = [
  { year: 2022, term: 1, startDate: date(2022, 9, 1),  endDate: date(2022, 12, 31), type: "Fall"   },
  { year: 2023, term: 2, startDate: date(2023, 1, 15), endDate: date(2023, 5, 31),  type: "Spring" },
  { year: 2023, term: 3, startDate: date(2023, 6, 15), endDate: date(2023, 8, 15),  type: "Summer" },
  { year: 2023, term: 1, startDate: date(2023, 9, 1),  endDate: date(2023, 12, 31), type: "Fall"   },
  { year: 2024, term: 2, startDate: date(2024, 1, 15), endDate: date(2024, 5, 31),  type: "Spring" },
  { year: 2024, term: 3, startDate: date(2024, 6, 15), endDate: date(2024, 8, 15),  type: "Summer" },
  { year: 2024, term: 1, startDate: date(2024, 9, 1),  endDate: date(2024, 12, 31), type: "Fall"   },
  { year: 2025, term: 2, startDate: date(2025, 1, 15), endDate: date(2025, 5, 31),  type: "Spring" },
  { year: 2025, term: 3, startDate: date(2025, 6, 15), endDate: date(2025, 8, 15),  type: "Summer" },
  { year: 2025, term: 1, startDate: date(2025, 9, 1),  endDate: date(2025, 12, 31), type: "Fall"   },
  // Current semester — Spring 2026 (term 2), ends July 5, 2026 per spec.
  { year: 2026, term: 2, startDate: date(2026, 1, 15), endDate: date(2026, 7, 5),   type: "Spring" },
];

// Classrooms — no explicit IDs; looked up by (classroomNumber, building).
const CLASSROOMS = [
  { classroomNumber: "H-101", building: "Main Building",  capacity: 120, type: "Hall"        as const, underMaintenance: false },
  { classroomNumber: "H-102", building: "Main Building",  capacity: 120, type: "Hall"        as const, underMaintenance: false },
  { classroomNumber: "H-201", building: "Main Building",  capacity: 80,  type: "Hall"        as const, underMaintenance: false },
  { classroomNumber: "H-202", building: "Main Building",  capacity: 80,  type: "Hall"        as const, underMaintenance: false },
  { classroomNumber: "L-101", building: "Lab Building",   capacity: 40,  type: "Lab"         as const, underMaintenance: false },
  { classroomNumber: "L-102", building: "Lab Building",   capacity: 40,  type: "Lab"         as const, underMaintenance: false },
  { classroomNumber: "L-201", building: "Lab Building",   capacity: 30,  type: "Lab"         as const, underMaintenance: false },
  { classroomNumber: "A-001", building: "Auditorium",     capacity: 300, type: "Auditorium"  as const, underMaintenance: false },
  { classroomNumber: "A-002", building: "Auditorium",     capacity: 250, type: "Auditorium"  as const, underMaintenance: false },
  { classroomNumber: "H-301", building: "Main Building",  capacity: 60,  type: "Hall"        as const, underMaintenance: true  },
];

// Roles — no explicit IDs; looked up by name.
const ROLES = [
  { name: "Root",        description: "Root account — unrestricted access to every resource in the tenant schema." },
  { name: "Admin",       description: "Tenant administrator with full access to all tenant resources." },
  { name: "Dean",        description: "Faculty dean — manages a faculty and its programs." },
  { name: "ProgramHead", description: "Head of an academic program." },
  { name: "Teacher",     description: "Teaching staff member." },
  { name: "Student",     description: "Enrolled student." },
];

// Permissions — no explicit IDs; looked up by name.
const PERMISSIONS = [
  { name: "role.create",              description: "Create new roles and assign permissions to them" },
  { name: "role.read",                description: "View and list all roles with their assigned permissions" },
  { name: "role.update",              description: "Modify existing roles and update their permissions" },
  { name: "role.delete",              description: "Delete roles and remove their associated permissions" },
  { name: "account.create",           description: "Create new user accounts" },
  { name: "account.read",             description: "View user account details and information" },
  { name: "account.update",           description: "Update user account information" },
  { name: "account.delete",           description: "Delete user accounts from the system" },
  { name: "account.assign_role",      description: "Assign one or more roles to a user account" },
  { name: "faculty.create",           description: "Create a new faculty" },
  { name: "faculty.read",             description: "View faculty details and list all faculties" },
  { name: "faculty.update",           description: "Update existing faculty information" },
  { name: "faculty.delete",           description: "Delete a faculty from the system" },
  { name: "program.create",           description: "Create a new program" },
  { name: "program.read",             description: "View program details and list all programs" },
  { name: "program.update",           description: "Update existing program information" },
  { name: "program.delete",           description: "Delete a program from the system" },
  { name: "course.create",            description: "Create a new course" },
  { name: "course.read",              description: "View course details and list all courses" },
  { name: "course.update",            description: "Update existing course information" },
  { name: "course.delete",            description: "Delete a course from the system" },
  { name: "courseAssessment.create",  description: "Create a new assessment for a specific course" },
  { name: "courseAssessment.read",    description: "View assessment details and retrieve all assessments associated with a specific course" },
  { name: "courseAssessment.update",  description: "Modify an existing assessment for a specific course" },
  { name: "semester.create",          description: "Create a new academic semester" },
  { name: "semester.read",            description: "View semester details and list all semesters" },
  { name: "semester.update",           description: "Update existing semester information" },
  { name: "semester.delete",          description: "Delete a semester from the system" },
  { name: "classroom.create",         description: "Create a new classroom" },
  { name: "classroom.read",           description: "View classroom details and list all classrooms" },
  { name: "classroom.update",         description: "Update existing classroom information" },
  { name: "classroom.delete",         description: "Delete a classroom from the system" },
  { name: "schedule.enroll",          description: "Enroll a student into a specific schedule" },
];

// All permission names (for Root + Admin)
const ALL_PERMISSION_NAMES = PERMISSIONS.map((p) => p.name);

// Role → Permission mapping (by NAME, not ID)
const ROLE_PERMISSIONS: Array<[string, string]> = [
  // Root → every permission
  ...ALL_PERMISSION_NAMES.map((n): [string, string] => ["Root", n]),
  // Admin → every permission
  ...ALL_PERMISSION_NAMES.map((n): [string, string] => ["Admin", n]),
  // Dean
  ["Dean", "role.read"],
  ["Dean", "account.read"],
  ["Dean", "account.update"],
  ["Dean", "account.assign_role"],
  ["Dean", "faculty.read"],
  ["Dean", "faculty.update"],
  ["Dean", "program.read"],
  ["Dean", "program.update"],
  ["Dean", "course.read"],
  ["Dean", "courseAssessment.read"],
  ["Dean", "semester.read"],
  ["Dean", "classroom.read"],
  ["Dean", "schedule.enroll"],
  // ProgramHead
  ["ProgramHead", "role.read"],
  ["ProgramHead", "account.read"],
  ["ProgramHead", "faculty.read"],
  ["ProgramHead", "program.read"],
  ["ProgramHead", "program.update"],
  ["ProgramHead", "course.create"],
  ["ProgramHead", "course.read"],
  ["ProgramHead", "course.update"],
  ["ProgramHead", "courseAssessment.create"],
  ["ProgramHead", "courseAssessment.read"],
  ["ProgramHead", "courseAssessment.update"],
  ["ProgramHead", "semester.read"],
  ["ProgramHead", "classroom.read"],
  ["ProgramHead", "schedule.enroll"],
  // Teacher
  ["Teacher", "account.read"],
  ["Teacher", "faculty.read"],
  ["Teacher", "program.read"],
  ["Teacher", "course.read"],
  ["Teacher", "courseAssessment.create"],
  ["Teacher", "courseAssessment.read"],
  ["Teacher", "courseAssessment.update"],
  ["Teacher", "semester.read"],
  ["Teacher", "classroom.read"],
  ["Teacher", "schedule.enroll"],
  // Student
  ["Student", "account.read"],
  ["Student", "course.read"],
  ["Student", "courseAssessment.read"],
  ["Student", "semester.read"],
  ["Student", "schedule.enroll"],
];

// Root & Admin account definitions (no explicit IDs)
const ROOT_USER = {
  username: "root",
  firstName: "System",
  lastName: "Root",
  email: "root@alexu.edu.eg",
  phone: "01000000000",
  dob: date(1980, 1, 1),
  address: "System Account — Administration Building",
  city: "Alexandria",
  nationalId: "ROOT_ACCOUNT_0001",
};

const ADMIN_USER = {
  username: "admin",
  firstName: "Tenant",
  lastName: "Admin",
  email: "admin@alexu.edu.eg",
  phone: "01000000001",
  dob: date(1985, 1, 1),
  address: "Administration Building, Office 101",
  city: "Alexandria",
  nationalId: "ADMIN_ACCOUNT_0001",
};

// Staff user definitions (no explicit IDs — username uniqueness from array position)
// Array order: indices 0-3 = deans, 4-15 = program heads, 16-39 = teachers
interface StaffUserDef {
  firstName: string;
  lastName: string;
  phone: string;
  dob: Date;
  address: string;
  city: string;
  nationalId: string;
  position: string;
  hireDate: Date;
  salary: number;
  role: "Dean" | "ProgramHead" | "Teacher";
}

const FIRST_NAMES = ["Ahmed","Mohamed","Mahmoud","Omar","Youssef","Karim","Hassan","Ali","Mostafa","Amr","Tarek","Sherif","Nour","Sara","Mona","Dina","Hala","Reem","Mariam","Yara","Heba","Noha","Salma","Farida","Lamia","Adel","Sami","Ramy","Fathy","Khaled","Tamer","Wael","Emad","Hossam","Ibrahim","Nabil"];
const LAST_NAMES  = ["Mansour","Barakat","Abdel-Rahman","Seif","Hassan","Sami","Fouad","Adel","Saber","Lotfy","Salah","Ghareeb","Mahmoud","El-Sayed","Abdo","Khalil","Rezk","Saad","Awad","Nasr","Younes","Zaki","Taha","Bassiouni","Hamdy","Sobhy","Galal","Ezzat","Roshdy","Badran"];

const STAFF_USERS: StaffUserDef[] = [];

// Deans
FACULTIES.forEach((fac) => {
  STAFF_USERS.push({
    firstName: fac.dean.firstName,
    lastName: fac.dean.lastName,
    phone: fac.dean.phone,
    dob: fac.dean.dob,
    address: fac.dean.address,
    city: fac.dean.city,
    nationalId: fac.dean.nationalId,
    position: "Dean",
    hireDate: date(2010, 9, 1),
    salary: 35000,
    role: "Dean",
  });
});

// Program heads (one per program = 12)
let nameIdx = 0;
PROGRAMS_BY_FACULTY.flat().forEach(() => {
  const fn = FIRST_NAMES[nameIdx % FIRST_NAMES.length];
  const ln = LAST_NAMES[(nameIdx + 3) % LAST_NAMES.length];
  nameIdx++;
  const pseudo = STAFF_USERS.length + 1;
  STAFF_USERS.push({
    firstName: fn,
    lastName: ln,
    phone: `010${String(20000000 + pseudo * 137).slice(0, 8)}`,
    dob: date(1978 + (pseudo % 5), (pseudo % 12) + 1, (pseudo % 27) + 1),
    address: `${pseudo * 11} El Geish Road, Alexandria`,
    city: "Alexandria",
    nationalId: `2850${String(1000000000 + pseudo * 9876543).slice(0, 10)}`,
    position: "Program Head",
    hireDate: date(2014, 2, 1),
    salary: 25000,
    role: "ProgramHead",
  });
});

// Teachers (2 per program = 24)
PROGRAMS_BY_FACULTY.flat().forEach((_prog, i) => {
  for (let t = 0; t < 2; t++) {
    const fn = FIRST_NAMES[(i * 2 + t + 5) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 2 + t + 7) % LAST_NAMES.length];
    const pseudo = STAFF_USERS.length + 1;
    STAFF_USERS.push({
      firstName: fn,
      lastName: ln,
      phone: `011${String(50000000 + pseudo * 311).slice(0, 8)}`,
      dob: date(1982 + (pseudo % 4), ((pseudo + 1) % 12) + 1, ((pseudo + 2) % 27) + 1),
      address: `${pseudo * 7} Smouha, Alexandria`,
      city: "Alexandria",
      nationalId: `2900${String(2000000000 + pseudo * 1234567).slice(0, 10)}`,
      position: t === 0 ? "Lecturer" : "Assistant Professor",
      hireDate: date(2017, 9, 1),
      salary: 18000 + (t * 2000),
      role: "Teacher",
    });
  }
});

// Student definitions (no explicit IDs; programIdx and level replace programId/programLevelId)
const STUDENT_FIRST_NAMES_M = ["Ahmed","Mohamed","Mahmoud","Omar","Youssef","Karim","Hassan","Ali","Mostafa","Amr","Tarek","Sherif","Khaled","Adel","Sami","Tamer","Wael","Emad","Hossam","Ibrahim","Nabil","Maged","Ramy","Said","Farouk"];
const STUDENT_FIRST_NAMES_F = ["Nour","Sara","Mona","Dina","Hala","Reem","Mariam","Yara","Heba","Noha","Salma","Farida","Lamia","Aya","Esraa","Doaa","Menna","Shahenda","Asmaa","Manar","Norhan","Walaa","Mervat","Samar","Hend"];
const STUDENT_LAST_NAMES  = ["Hassan","Sami","Fouad","Adel","Saber","Lotfy","Salah","Ghareeb","Mahmoud","El-Sayed","Abdo","Khalil","Rezk","Saad","Awad","Nasr","Younes","Zaki","Taha","Bassiouni","Hamdy","Sobhy","Galal","Ezzat","Roshdy","Badran","Mansour","Barakat","Seif","Salem"];
const CITIES = ["Alexandria","Cairo","Giza","Mansoura","Tanta","Port Said","Suez","Asyut"];

interface StudentUserDef {
  firstName: string;
  lastName: string;
  phone: string;
  dob: Date;
  address: string;
  city: string;
  nationalId: string;
  universityStudentId: number;
  programIdx: number;   // 0-11, index into PROGRAMS_BY_FACULTY.flat()
  enrollmentDate: Date;
  cgpa: number;
  level: number;        // 1-4
  religion: "M" | "C";
  gender: "M" | "F";
  fullname: string;
  homePhone: string;
  previousQualification: string;
  secondarySchoolName: string;
  totalHighSchoolGrades: number;
  highSchoolSeatNumber: string;
  status: "New" | "Repeat" | "SingleChance" | "ExternalReenrollment" | "Deactivate";
}

const STUDENT_USERS: StudentUserDef[] = [];
{
  let uniId = 20220001;
  PROGRAMS_BY_FACULTY.flat().forEach((prog, pIdx) => {
    for (let i = 0; i < 10; i++) {
      const gender: "M" | "F" = i % 2 === 0 ? "M" : "F";
      const fn = gender === "M"
        ? STUDENT_FIRST_NAMES_M[(pIdx * 10 + i) % STUDENT_FIRST_NAMES_M.length]
        : STUDENT_FIRST_NAMES_F[(pIdx * 10 + i) % STUDENT_FIRST_NAMES_F.length];
      const ln = STUDENT_LAST_NAMES[(pIdx * 10 + i) % STUDENT_LAST_NAMES.length];
      const pseudo = STUDENT_USERS.length + 1;
      const level = (i % 4) + 1;
      const cgpa = +(2.0 + ((pIdx * 13 + i * 7) % 21) / 10).toFixed(4);
      STUDENT_USERS.push({
        firstName: fn,
        lastName: ln,
        phone: `010${String(60000000 + pseudo * 211).slice(0, 8)}`,
        dob: date(2002 + (pseudo % 3), ((pseudo + 1) % 12) + 1, ((pseudo + 2) % 27) + 1),
        address: `${pseudo * 5} ${CITIES[pseudo % CITIES.length]} St.`,
        city: CITIES[pseudo % CITIES.length],
        nationalId: `2980${String(3000000000 + pseudo * 7654321).slice(0, 10)}`,
        universityStudentId: uniId,
        programIdx: pIdx,
        enrollmentDate: date(2022, 9, 1),
        cgpa,
        level,
        religion: (pseudo % 10 === 0) ? "C" : "M",
        gender,
        fullname: `${fn} ${ln}`,
        homePhone: `02${String(30000000 + pseudo * 1234).slice(0, 8)}`,
        previousQualification: "Thanaweya Amma",
        secondarySchoolName: `${CITIES[pseudo % CITIES.length]} Secondary School`,
        totalHighSchoolGrades: +(75 + ((pseudo * 7) % 24)).toFixed(2),
        highSchoolSeatNumber: String(100000 + pseudo * 137),
        status: "New",
      });
      uniId++;
    }
  });
}

// ============================================================================
// HELPERS
// ============================================================================

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

function log(section: string, count: number) {
  console.log(`  ✓ ${section.padEnd(40)} ${count} row(s)`);
}

function section(title: string) {
  console.log("");
  console.log(`── ${title} ─────────────────────────────────────────`);
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedRolesAndPermissions(prisma: DbClient, ctx: SeedContext) {
  section("Roles & Permissions");

  await prisma.role.createMany({ data: ROLES, skipDuplicates: true });
  const roles = await prisma.role.findMany({ select: { id: true, name: true } });
  roles.forEach((r) => ctx.roleNameToId.set(r.name, r.id));
  log("Roles", roles.length);

  await prisma.permission.createMany({ data: PERMISSIONS, skipDuplicates: true });
  const perms = await prisma.permission.findMany({ select: { id: true, name: true } });
  perms.forEach((p) => ctx.permNameToId.set(p.name, p.id));
  log("Permissions", perms.length);

  const rpData = ROLE_PERMISSIONS
    .map(([roleName, permName]) => ({
      roleId: ctx.roleNameToId.get(roleName),
      permissionId: ctx.permNameToId.get(permName),
    }))
    .filter((rp) => rp.roleId != null && rp.permissionId != null) as Array<{
      roleId: number;
      permissionId: number;
    }>;
  await prisma.rolePermission.createMany({ data: rpData, skipDuplicates: true });
  log("RolePermissions", rpData.length);
}

async function seedRootAndAdminUsers(prisma: DbClient, ctx: SeedContext) {
  section("Root & Admin Accounts (tenant-level administrators)");

  const hashRoot  = await hashPassword(PWD_ROOT);
  const hashAdmin = await hashPassword(PWD_ADMIN);

  // Plaintext password: Root@2025
  const rootUser = {
    username: ROOT_USER.username,
    firstName: ROOT_USER.firstName,
    lastName: ROOT_USER.lastName,
    email: ROOT_USER.email,
    password: hashRoot,
    isVerified: true,
    isBlocked: false,
    phone: ROOT_USER.phone,
    dateOfBirth: ROOT_USER.dob,
    address: ROOT_USER.address,
    city: ROOT_USER.city,
    country: "Egypt",
    nationalId: ROOT_USER.nationalId,
  };

  // Plaintext password: Admin@2025
  const adminUser = {
    username: ADMIN_USER.username,
    firstName: ADMIN_USER.firstName,
    lastName: ADMIN_USER.lastName,
    email: ADMIN_USER.email,
    password: hashAdmin,
    isVerified: true,
    isBlocked: false,
    phone: ADMIN_USER.phone,
    dateOfBirth: ADMIN_USER.dob,
    address: ADMIN_USER.address,
    city: ADMIN_USER.city,
    country: "Egypt",
    nationalId: ADMIN_USER.nationalId,
  };

  await prisma.user.createMany({ data: [rootUser, adminUser], skipDuplicates: true });

  const found = await prisma.user.findMany({
    where: { username: { in: [ROOT_USER.username, ADMIN_USER.username] } },
    select: { id: true, username: true },
  });
  ctx.rootUserId  = found.find((u) => u.username === ROOT_USER.username)!.id;
  ctx.adminUserId = found.find((u) => u.username === ADMIN_USER.username)!.id;
  ctx.usernameToUserId.set(ROOT_USER.username, ctx.rootUserId);
  ctx.usernameToUserId.set(ADMIN_USER.username, ctx.adminUserId);

  log("Root & Admin Users", 2);
  console.log("    Credentials:");
  console.log("      • Root  → username: root   | password: Root@2025  | email: root@alexu.edu.eg");
  console.log("      • Admin → username: admin  | password: Admin@2025 | email: admin@alexu.edu.eg");
}

async function seedStaffUsers(prisma: DbClient, ctx: SeedContext) {
  section("Staff Users (Deans / Program Heads / Teachers)");

  const hashDean    = await hashPassword(PWD_DEAN);
  const hashHead    = await hashPassword(PWD_HEAD);
  const hashTeacher = await hashPassword(PWD_TEACHER);

  const users = STAFF_USERS.map((s, i) => {
    const passwordHash =
      s.role === "Dean"        ? hashDean :
      s.role === "ProgramHead" ? hashHead :
                                 hashTeacher;
    const username = `${s.role.toLowerCase()}.${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}.${i + 1}`;
    const email = `${username}@alexu.edu.eg`;
    ctx.usernameToUserId.set(username, 0); // placeholder — updated after findMany
    return {
      username,
      firstName: s.firstName,
      lastName: s.lastName,
      email,
      password: passwordHash,
      isVerified: true,
      isBlocked: false,
      phone: s.phone,
      dateOfBirth: s.dob,
      address: s.address,
      city: s.city,
      country: "Egypt",
      nationalId: s.nationalId,
    };
  });

  await prisma.user.createMany({ data: users, skipDuplicates: true });

  // Fetch back generated IDs by username
  const found = await prisma.user.findMany({
    where: { username: { in: users.map((u) => u.username) } },
    select: { id: true, username: true },
  });
  STAFF_USERS.forEach((s, i) => {
    const username = users[i].username;
    const userId = found.find((u) => u.username === username)!.id;
    ctx.usernameToUserId.set(username, userId);
    ctx.staffUserIds.push(userId);
  });
  log("Staff Users", users.length);

  // Staff records (PK = userId, not autoincrement)
  const staff = STAFF_USERS.map((s, i) => ({
    userId: ctx.staffUserIds[i],
    position: s.position,
    hireDate: s.hireDate,
    salary: s.salary,
  }));
  await prisma.staff.createMany({ data: staff, skipDuplicates: true });
  log("Staff records", staff.length);
}

async function seedFacultiesAndPrograms(prisma: DbClient, ctx: SeedContext) {
  section("Faculties, Programs, ProgramStaff, Regulations");

  // Faculties — use create() to capture IDs
  for (let i = 0; i < FACULTIES.length; i++) {
    const f = FACULTIES[i];
    const faculty = await prisma.faculty.create({
      data: {
        universityId: UNIVERSITY_ID,
        name: f.name,
        description: f.description,
        deanId: ctx.staffUserIds[i], // dean staff index = faculty index
        establishedDate: date(1960 + i * 5, 9, 1),
      },
    });
    ctx.facultyNameToId.set(f.name, faculty.id);
  }
  log("Faculties", FACULTIES.length);

  // Programs — use create() to capture IDs
  const allPrograms = PROGRAMS_BY_FACULTY.flat();
  let headIdx = 4; // staff indices 4-15 are program heads
  for (let pIdx = 0; pIdx < allPrograms.length; pIdx++) {
    const p = allPrograms[pIdx];
    const facIdx = Math.floor(pIdx / 3);
    const facultyId = ctx.facultyNameToId.get(FACULTIES[facIdx].name)!;
    const program = await prisma.program.create({
      data: {
        facultyId,
        name: p.name,
        description: p.description,
        headId: ctx.staffUserIds[headIdx],
        phone: p.phone,
        universityCreditHours: p.universityCreditHours,
        facultyCreditHours: p.facultyCreditHours,
        programCreditHours: p.programCreditHours,
        durationYears: p.durationYears,
        programType: p.programType as any,
        resultDisplay: "CourseGrade" as const,
      },
    });
    ctx.programNameToId.set(p.name, program.id);
    headIdx++;
  }
  log("Programs", allPrograms.length);

  // ProgramStaff — head + 2 teachers per program
  const programStaff: Array<any> = [];
  let teacherIdx = 16; // staff indices 16-39 are teachers
  for (let pIdx = 0; pIdx < allPrograms.length; pIdx++) {
    const facIdx = Math.floor(pIdx / 3);
    const facultyId = ctx.facultyNameToId.get(FACULTIES[facIdx].name)!;
    const programName = allPrograms[pIdx].name;
    const programId = ctx.programNameToId.get(programName)!;
    // head
    programStaff.push({
      staffId: ctx.staffUserIds[4 + pIdx],
      programId,
      facultyId,
    });
    // 2 teachers
    for (let t = 0; t < 2; t++) {
      programStaff.push({
        staffId: ctx.staffUserIds[teacherIdx],
        programId,
        facultyId,
      });
      teacherIdx++;
    }
  }
  await prisma.programStaff.createMany({ data: programStaff, skipDuplicates: true });
  log("ProgramStaff", programStaff.length);

  // Regulations — use create() to capture IDs for mercy rules
  for (let i = 0; i < FACULTIES.length; i++) {
    const f = FACULTIES[i];
    const facultyId = ctx.facultyNameToId.get(f.name)!;
    const regulation = await prisma.regulation.create({
      data: {
        facultyId,
        name: f.regulation.name,
        roundToWholeNumber: false,
        approximateFractions: true,
        maxAbsence: f.regulation.maxAbsence,
        minGradeExcellent:  f.regulation.excellent,
        minGradeVeryGood:   f.regulation.veryGood,
        minGradeGood:       f.regulation.good,
        minGradeAcceptable: f.regulation.acceptable,
        minGradeVeryWeak:   f.regulation.veryWeak,
        enableMercyRules:   true,
      },
    });
    ctx.regulationIdByFacultyId.set(facultyId, regulation.id);

    // Mercy rules — 3 per regulation
    const mercyRules = [
      { original: 48, adjusted: 50 },
      { original: 57, adjusted: 60 },
      { original: 67, adjusted: 70 },
    ].map((m) => ({
      regulationId: regulation.id,
      originalScore: m.original,
      adjustedScore: m.adjusted,
    }));
    await prisma.mercyRule.createMany({ data: mercyRules, skipDuplicates: true });
  }
  log("Regulations + MercyRules", FACULTIES.length);
}

async function seedProgramLevelsAndLoads(prisma: DbClient, ctx: SeedContext) {
  section("Program Levels, Academic Loads, Transcript Definitions, Fees");

  const allPrograms = PROGRAMS_BY_FACULTY.flat();

  // Program Levels — use create() to capture IDs
  for (let pIdx = 0; pIdx < allPrograms.length; pIdx++) {
    const programId = ctx.programNameToId.get(allPrograms[pIdx].name)!;
    for (let lvl = 1; lvl <= 4; lvl++) {
      const pl = await prisma.programLevel.create({
        data: {
          programId,
          level: lvl,
          minCredits: 12,
          maxCredits: 21,
        },
      });
      ctx.programLevelIdByKey.set(`${programId}:${lvl}`, pl.id);
    }
  }
  log("ProgramLevels", allPrograms.length * 4);

  // Academic Load Semesters (no ID needed back)
  const academicLoadSemesters: Array<any> = [];
  for (let pIdx = 0; pIdx < allPrograms.length; pIdx++) {
    const programId = ctx.programNameToId.get(allPrograms[pIdx].name)!;
    for (let lvl = 1; lvl <= 4; lvl++) {
      const programLevelId = ctx.programLevelIdByKey.get(`${programId}:${lvl}`)!;
      for (let semNum = 1; semNum <= 8; semNum++) {
        academicLoadSemesters.push({
          programId,
          semesterNumber: semNum,
          programLevelId,
          minCredits: 12,
          maxCredits: 18,
        });
      }
    }
  }
  await prisma.academicLoadSemester.createMany({ data: academicLoadSemesters, skipDuplicates: true });
  log("AcademicLoadSemesters", academicLoadSemesters.length);

  // Academic Load GPAs
  const academicLoadGpas: Array<any> = [];
  for (let pIdx = 0; pIdx < allPrograms.length; pIdx++) {
    const programId = ctx.programNameToId.get(allPrograms[pIdx].name)!;
    [
      { min: 0.0,  max: 2.0,  minCr: 12, maxCr: 15 },
      { min: 2.0,  max: 3.0,  minCr: 15, maxCr: 18 },
      { min: 3.0,  max: 4.0,  minCr: 18, maxCr: 21 },
    ].forEach((g) => {
      academicLoadGpas.push({
        programId,
        minGpa: g.min,
        maxGpa: g.max,
        minCredits: g.minCr,
        maxCredits: g.maxCr,
      });
    });
  }
  await prisma.academicLoadGPA.createMany({ data: academicLoadGpas, skipDuplicates: true });
  log("AcademicLoadGPAs", academicLoadGpas.length);

  // Program Transcript Definitions
  const grades: Array<{ letter: any; min: number; max: number; est: string; minGpa: number; maxGpa: number }> = [
    { letter: "A", min: 90, max: 100, est: "Excellent",   minGpa: 3.7, maxGpa: 4.0 },
    { letter: "B", min: 80, max: 89,  est: "Very Good",   minGpa: 3.0, maxGpa: 3.69 },
    { letter: "C", min: 70, max: 79,  est: "Good",        minGpa: 2.4, maxGpa: 2.99 },
    { letter: "D", min: 60, max: 69,  est: "Acceptable",  minGpa: 2.0, maxGpa: 2.39 },
    { letter: "F", min: 0,  max: 59,  est: "Fail",        minGpa: 0.0, maxGpa: 1.99 },
  ];
  const transcriptDefs: Array<any> = [];
  for (let pIdx = 0; pIdx < allPrograms.length; pIdx++) {
    const programId = ctx.programNameToId.get(allPrograms[pIdx].name)!;
    grades.forEach((g) => {
      transcriptDefs.push({
        programId,
        gradeLetter: g.letter,
        minScore: g.min,
        maxScore: g.max,
        equivalentEstimate: g.est,
        minGpa: g.minGpa,
        maxGpa: g.maxGpa,
      });
    });
  }
  await prisma.programTranscriptDefinition.createMany({ data: transcriptDefs, skipDuplicates: true });
  log("ProgramTranscriptDefinitions", transcriptDefs.length);

  // Fees — use createMany + findMany to capture IDs
  const feesData: Array<any> = [];
  for (let pIdx = 0; pIdx < allPrograms.length; pIdx++) {
    const programId = ctx.programNameToId.get(allPrograms[pIdx].name)!;
    for (let lvl = 1; lvl <= 4; lvl++) {
      const programLevelId = ctx.programLevelIdByKey.get(`${programId}:${lvl}`)!;
      for (let semNum = 1; semNum <= 8; semNum++) {
        feesData.push({
          programLevelId,
          semesterNumber: semNum,
          feeType: "ConstantSemester",
          amount: 5000 + (lvl * 500),
          description: `Semester ${semNum} tuition — Level ${lvl}`,
        });
      }
    }
  }
  await prisma.fee.createMany({ data: feesData, skipDuplicates: true });
  // Fetch back all fees to build lookup map
  const fees = await prisma.fee.findMany({
    select: { id: true, programLevelId: true, semesterNumber: true, feeType: true },
  });
  fees.forEach((f) => {
    ctx.feeIdByKey.set(`${f.programLevelId}:${f.semesterNumber}`, f.id);
  });
  log("Fees", feesData.length);
}

async function seedSemesters(prisma: DbClient, ctx: SeedContext) {
  section("Semesters (Tracking History)");

  await prisma.semester.createMany({
    data: SEMESTERS.map((s) => ({
      year: s.year,
      term: s.term,
      startDate: s.startDate,
      endDate: s.endDate,
      type: s.type as any,
    })),
    skipDuplicates: true,
  });

  // Fetch back IDs by (year, term)
  const found = await prisma.semester.findMany({
    select: { id: true, year: true, term: true },
  });
  ctx.currentSemesterId = found.find((s) => s.year === CURRENT_SEMESTER_YEAR && s.term === CURRENT_SEMESTER_TERM)!.id;
  ctx.pastSemesterId    = found.find((s) => s.year === PAST_SEMESTER_YEAR    && s.term === PAST_SEMESTER_TERM)!.id;

  log("Semesters", SEMESTERS.length);
  console.log(`    Current semester ID: ${ctx.currentSemesterId} (Spring 2026)`);
  console.log(`    Past semester ID:    ${ctx.pastSemesterId} (Fall 2025)`);
}

async function seedCoursesAndProgramCourses(prisma: DbClient, ctx: SeedContext) {
  section("Courses, ProgramCourses, Prerequisites");

  const allPrograms = PROGRAMS_BY_FACULTY.flat();

  // Courses — use createMany + findMany by code
  const coursesData: Array<any> = [];
  allPrograms.forEach((prog) => {
    prog.courses.forEach((c) => {
      coursesData.push({
        name: c.name,
        code: c.code,
        description: `${c.name} — ${c.credits} credit hours.`,
        credits: c.credits,
        syllabus: `Syllabus for ${c.name}. Topics covered: core concepts, applications, and assessments.`,
        successPercentage: 60,
        totalFail: false,
        minFinalSuccessPercentage: 50,
      });
    });
  });
  await prisma.course.createMany({ data: coursesData, skipDuplicates: true });
  const found = await prisma.course.findMany({ select: { id: true, code: true } });
  found.forEach((c) => ctx.courseCodeToId.set(c.code, c.id));
  log("Courses", coursesData.length);

  // ProgramCourses
  const programCourses: Array<any> = [];
  allPrograms.forEach((prog) => {
    const programId = ctx.programNameToId.get(prog.name)!;
    prog.courses.forEach((c) => {
      const courseId = ctx.courseCodeToId.get(c.code)!;
      const programLevelId = ctx.programLevelIdByKey.get(`${programId}:${c.level}`)!;
      programCourses.push({
        programId,
        programLevelId,
        courseId,
        type: c.type as any,
      });
    });
  });
  await prisma.programCourse.createMany({ data: programCourses, skipDuplicates: true });
  log("ProgramCourses", programCourses.length);

  // Prerequisites — within each program, level N+1 course requires level N course
  const prereqs: Array<any> = [];
  allPrograms.forEach((prog) => {
    for (let ci = 0; ci < prog.courses.length; ci++) {
      if (ci >= 2) {
        const courseCode = prog.courses[ci].code;
        const prereqCode = prog.courses[ci - 2].code;
        const courseId = ctx.courseCodeToId.get(courseCode);
        const prerequisiteId = ctx.courseCodeToId.get(prereqCode);
        if (courseId && prerequisiteId) {
          prereqs.push({ courseId, prerequisiteId });
        }
      }
    }
  });
  await prisma.coursePrerequisite.createMany({ data: prereqs, skipDuplicates: true });
  log("CoursePrerequisites", prereqs.length);
}

async function seedClassrooms(prisma: DbClient, ctx: SeedContext) {
  section("Classrooms");

  await prisma.classroom.createMany({
    data: CLASSROOMS.map((c) => ({
      classroomNumber: c.classroomNumber,
      building: c.building,
      capacity: c.capacity,
      type: c.type as any,
      underMaintenance: c.underMaintenance,
    })),
    skipDuplicates: true,
  });
  const found = await prisma.classroom.findMany({
    select: { id: true, classroomNumber: true, building: true },
  });
  found.forEach((c) => ctx.classroomIdByKey.set(`${c.classroomNumber}:${c.building}`, c.id));
  log("Classrooms", CLASSROOMS.length);
}

async function seedScheduleSlotsAndContexts(prisma: DbClient, ctx: SeedContext) {
  section("Schedule Slots & Contexts — Teaching Assignments (current semester)");

  // Track which (teacher, day, time) and (classroom, day, time) are booked
  const teacherBooked = new Set<string>();
  const classroomBooked = new Set<string>();

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday"] as const;
  const timePairs = [
    { s: time(8,  0), e: time(10, 0) },
    { s: time(10, 0), e: time(12, 0) },
    { s: time(13, 0), e: time(15, 0) },
    { s: time(15, 0), e: time(17, 0) },
  ];
  const availableClassroomKeys = CLASSROOMS
    .filter((c) => !c.underMaintenance)
    .map((c) => `${c.classroomNumber}:${c.building}`);

  const teachingAssignments: Array<{
    programName: string;
    courseCode: string;
    courseName: string;
    teacherName: string;
  }> = [];

  function findFreeCombo(teacherId: number): { dayIdx: number; timeIdx: number; classroomKey: string } | null {
    for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
      for (let timeIdx = 0; timeIdx < timePairs.length; timeIdx++) {
        const teacherKey = `${teacherId}-${dayIdx}-${timeIdx}`;
        if (teacherBooked.has(teacherKey)) continue;
        for (const classroomKey of availableClassroomKeys) {
          const crKey = `${classroomKey}-${dayIdx}-${timeIdx}`;
          if (!classroomBooked.has(crKey)) {
            teacherBooked.add(teacherKey);
            classroomBooked.add(crKey);
            return { dayIdx, timeIdx, classroomKey };
          }
        }
      }
    }
    return null;
  }

  const allPrograms = PROGRAMS_BY_FACULTY.flat();
  const staffName = (idx: number) => {
    const s = STAFF_USERS[idx];
    return s ? `${s.firstName} ${s.lastName}` : `Staff#${idx}`;
  };

  for (let pIdx = 0; pIdx < allPrograms.length; pIdx++) {
    const prog = allPrograms[pIdx];
    const programId = ctx.programNameToId.get(prog.name)!;

    // Teaching staff: head (staff index 4 + pIdx) + 2 teachers (indices 16 + pIdx*2, 17 + pIdx*2)
    const headStaffIdx = 4 + pIdx;
    const teacher1StaffIdx = 16 + pIdx * 2;
    const teacher2StaffIdx = 17 + pIdx * 2;
    const teachingStaffIndices = [headStaffIdx, teacher1StaffIdx, teacher2StaffIdx];

    for (let ci = 0; ci < prog.courses.length; ci++) {
      const c = prog.courses[ci];
      const courseId = ctx.courseCodeToId.get(c.code)!;
      const staffIdx = teachingStaffIndices[ci % teachingStaffIndices.length];
      const teacherId = ctx.staffUserIds[staffIdx];

      const free = findFreeCombo(teacherId);
      if (!free) {
        console.warn(`  ! Could not find free slot for course ${c.code} (program ${prog.name})`);
        continue;
      }

      const { dayIdx, timeIdx, classroomKey } = free;
      const classroomId = ctx.classroomIdByKey.get(classroomKey)!;
      const tp = timePairs[timeIdx];

      // Create slot — capture generated ID
      const slot = await prisma.scheduleSlot.create({
        data: {
          teacherId,
          courseId,
          classroomId,
          semesterId: ctx.currentSemesterId,
          dayOfWeek: days[dayIdx] as any,
          startTime: tp.s,
          endTime: tp.e,
          type: "Lecture" as const,
          allowedCapacity: 120,
          enrolledSeats: 0,
        },
      });

      // Create context — capture generated ID
      const slotCtx = await prisma.scheduleSlotContext.create({
        data: {
          slotId: slot.id,
          programId,
          academicLevel: c.level,
          semesterId: ctx.currentSemesterId,
        },
      });

      // Store in ctx for later lookups
      ctx.slots.push({
        slotId: slot.id,
        contextId: slotCtx.id,
        courseId,
        programId,
        academicLevel: c.level,
        teacherId,
      });

      teachingAssignments.push({
        programName: prog.name,
        courseCode: c.code,
        courseName: c.name,
        teacherName: staffName(staffIdx),
      });
    }
  }

  log("ScheduleSlots + Contexts (1 Lecture per course)", ctx.slots.length);
  log("Teaching assignments (course → doctor)", teachingAssignments.length);

  console.log("    Sample teaching assignments:");
  teachingAssignments.slice(0, 6).forEach((t) => {
    console.log(`      • [${t.programName}] ${t.courseCode} ${t.courseName.padEnd(45).slice(0, 45)}  →  Dr. ${t.teacherName}`);
  });
  console.log(`      ... and ${teachingAssignments.length - 6} more.`);
}

async function seedStudentUsers(prisma: DbClient, ctx: SeedContext) {
  section("Student Users + Student Records");

  const hashStudent = await hashPassword(PWD_STUDENT);
  const allPrograms = PROGRAMS_BY_FACULTY.flat();

  const users = STUDENT_USERS.map((s, i) => {
    const username = `student.${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}.${i + 1}`;
    const email = `${username}@alexu.edu.eg`;
    return {
      username,
      firstName: s.firstName,
      lastName: s.lastName,
      email,
      password: hashStudent,
      isVerified: true,
      isBlocked: false,
      phone: s.phone,
      dateOfBirth: s.dob,
      address: s.address,
      city: s.city,
      country: "Egypt",
      nationalId: s.nationalId,
    };
  });

  await prisma.user.createMany({ data: users, skipDuplicates: true });

  // Fetch back generated IDs by username
  const found = await prisma.user.findMany({
    where: { username: { in: users.map((u) => u.username) } },
    select: { id: true, username: true },
  });

  // Build ctx.students with program/level info
  const studentsData: Array<any> = [];
  STUDENT_USERS.forEach((s, i) => {
    const username = users[i].username;
    const userId = found.find((u) => u.username === username)!.id;
    ctx.usernameToUserId.set(username, userId);

    const programName = allPrograms[s.programIdx].name;
    const programId = ctx.programNameToId.get(programName)!;
    const programLevelId = ctx.programLevelIdByKey.get(`${programId}:${s.level}`)!;

    ctx.students.push({
      userId,
      programId,
      level: s.level,
      programLevelId,
      cgpa: s.cgpa,
    });

    studentsData.push({
      userId,
      universityStudentId: s.universityStudentId,
      programId,
      status: s.status as any,
      enrollmentDate: s.enrollmentDate,
      cgpa: s.cgpa,
      homePhone: s.homePhone,
      previousQualification: s.previousQualification,
      secondarySchoolName: s.secondarySchoolName,
      totalHighSchoolGrades: s.totalHighSchoolGrades,
      highSchoolSeatNumber: s.highSchoolSeatNumber,
      programLevelId,
      religion: s.religion,
      gender: s.gender,
      fullname: s.fullname,
    });
  });

  log("Student Users", users.length);
  await prisma.student.createMany({ data: studentsData, skipDuplicates: true });
  log("Student records", studentsData.length);
}

async function seedUserRoles(prisma: DbClient, ctx: SeedContext) {
  section("User Roles");

  const userRoles: Array<any> = [];
  const rootRoleId = ctx.roleNameToId.get("Root")!;
  const adminRoleId = ctx.roleNameToId.get("Admin")!;
  const deanRoleId = ctx.roleNameToId.get("Dean")!;
  const headRoleId = ctx.roleNameToId.get("ProgramHead")!;
  const teacherRoleId = ctx.roleNameToId.get("Teacher")!;
  const studentRoleId = ctx.roleNameToId.get("Student")!;

  // Root & Admin
  userRoles.push({ userId: ctx.rootUserId, roleId: rootRoleId });
  userRoles.push({ userId: ctx.adminUserId, roleId: adminRoleId });

  // Deans (staff indices 0-3)
  for (let i = 0; i < 4; i++) userRoles.push({ userId: ctx.staffUserIds[i], roleId: deanRoleId });
  // Program Heads (staff indices 4-15)
  for (let i = 4; i < 16; i++) userRoles.push({ userId: ctx.staffUserIds[i], roleId: headRoleId });
  // Teachers (staff indices 16-39)
  for (let i = 16; i < 40; i++) userRoles.push({ userId: ctx.staffUserIds[i], roleId: teacherRoleId });
  // Students
  ctx.students.forEach((s) => userRoles.push({ userId: s.userId, roleId: studentRoleId }));

  await prisma.userRole.createMany({ data: userRoles, skipDuplicates: true });
  log("UserRoles", userRoles.length);
}

async function seedCourseAssessments(prisma: DbClient, ctx: SeedContext) {
  section("Course Assessments (current semester — Spring 2026)");

  const assessments: Array<any> = [];
  const courseIds = [...new Set(ctx.slots.map((s) => s.courseId))];

  courseIds.forEach((courseId) => {
    [
      { label: "Quiz 1",     type: "Quiz",       marks: 10 },
      { label: "Midterm",    type: "Midterm",    marks: 30 },
      { label: "Final Exam", type: "Final",      marks: 60 },
    ].forEach((a) => {
      assessments.push({
        courseId,
        semesterId: ctx.currentSemesterId,
        label: a.label,
        assessmentType: a.type as any,
        marks: a.marks,
      });
    });
  });

  await prisma.courseAssessment.createMany({ data: assessments, skipDuplicates: true });
  log("CourseAssessments (current)", assessments.length);
}

async function seedCourseRegistrationsAndGrades(prisma: DbClient, ctx: SeedContext) {
  section("Course Registrations & Grades (current + past semester)");

  // ------------------------------------------------------------------
  // 1. Current-semester registrations (status: InProgress)
  // ------------------------------------------------------------------
  const currentRegs: Array<any> = [];
  for (const student of ctx.students) {
    const studentSlots = ctx.slots.filter(
      (s) => s.programId === student.programId && s.academicLevel === student.level
    );
    for (const slot of studentSlots) {
      currentRegs.push({
        studentId: student.userId,
        semesterId: ctx.currentSemesterId,
        enrollmentDate: date(2026, 1, 20),
        status: "InProgress" as const,
        slotContextId: slot.contextId,
      });
    }
  }
  await prisma.courseRegistration.createMany({ data: currentRegs, skipDuplicates: true });
  log(`CourseRegistrations (Spring 2026)`, currentRegs.length);

  // ------------------------------------------------------------------
  // 2. Past-semester assessments (Quiz + Midterm + Final per course)
  // ------------------------------------------------------------------
  const pastAssessments: Array<any> = [];
  const courseIds = [...new Set(ctx.slots.map((s) => s.courseId))];
  courseIds.forEach((courseId) => {
    [
      { label: "Quiz 1",     type: "Quiz",    marks: 10 },
      { label: "Midterm",    type: "Midterm", marks: 30 },
      { label: "Final Exam", type: "Final",   marks: 60 },
    ].forEach((a) => {
      pastAssessments.push({
        courseId,
        semesterId: ctx.pastSemesterId,
        label: a.label,
        assessmentType: a.type as any,
        marks: a.marks,
      });
    });
  });
  await prisma.courseAssessment.createMany({ data: pastAssessments, skipDuplicates: true });
  log(`CourseAssessments (Fall 2025)`, pastAssessments.length);

  // Fetch past-sem assessment IDs by (courseId, label)
  const pastAssessmentsFromDb = await prisma.courseAssessment.findMany({
    where: { semesterId: ctx.pastSemesterId },
    select: { id: true, courseId: true, label: true, marks: true },
  });
  const assessmentsByCourse = new Map<number, typeof pastAssessmentsFromDb>();
  pastAssessmentsFromDb.forEach((a) => {
    const arr = assessmentsByCourse.get(a.courseId) ?? [];
    arr.push(a);
    assessmentsByCourse.set(a.courseId, arr);
  });

  // ------------------------------------------------------------------
  // 3. Past-semester registrations (status: Completed, grade: B)
  // ------------------------------------------------------------------
  const pastRegs: Array<any> = [];
  for (const student of ctx.students) {
    const studentSlots = ctx.slots.filter(
      (s) => s.programId === student.programId && s.academicLevel === student.level
    );
    for (const slot of studentSlots) {
      pastRegs.push({
        studentId: student.userId,
        semesterId: ctx.pastSemesterId,
        enrollmentDate: date(2025, 9, 15),
        status: "Completed" as const,
        grade: "B" as any,
        gradePoints: 3.0,
        slotContextId: slot.contextId,
      });
    }
  }
  await prisma.courseRegistration.createMany({ data: pastRegs, skipDuplicates: true });
  log(`CourseRegistrations (Fall 2025)`, pastRegs.length);

  // Fetch past-sem registration IDs by (studentId, slotContextId)
  const pastRegsFromDb = await prisma.courseRegistration.findMany({
    where: { semesterId: ctx.pastSemesterId },
    select: { id: true, studentId: true, slotContextId: true },
  });
  const regIdByKey = new Map<string, number>();
  pastRegsFromDb.forEach((r) => {
    regIdByKey.set(`${r.studentId}:${r.slotContextId}`, r.id);
  });

  // ------------------------------------------------------------------
  // 4. Grades — one per (past registration × assessment)
  // ------------------------------------------------------------------
  const grades: Array<any> = [];
  let regCounter = 0;
  for (const student of ctx.students) {
    const studentSlots = ctx.slots.filter(
      (s) => s.programId === student.programId && s.academicLevel === student.level
    );
    for (const slot of studentSlots) {
      const regId = regIdByKey.get(`${student.userId}:${slot.contextId}`);
      if (!regId) continue;
      const assess = assessmentsByCourse.get(slot.courseId) ?? [];
      assess.forEach((a) => {
        const maxMarksNum = Number(a.marks.toString());
        const pct = 0.4 + ((regId * 7 + a.id * 3) % 56) / 100;
        const marks = +(maxMarksNum * pct).toFixed(2);
        grades.push({
          courseRegistrationId: regId,
          courseAssessmentId: a.id,
          marks,
          maxMarks: a.marks,
          assessmentDate: date(2025, 12, 15),
          comments: "Auto-seeded grade.",
        });
      });
      regCounter++;
    }
  }
  await prisma.grade.createMany({ data: grades, skipDuplicates: true });
  log("Grades (Fall 2025)", grades.length);
}

async function seedTranscripts(prisma: DbClient, ctx: SeedContext) {
  section("Transcripts (Fall 2025)");

  const transcripts = ctx.students.map((s) => ({
    studentId: s.userId,
    semesterId: ctx.pastSemesterId,
    year: 2025,
    semesterGpa: s.cgpa,
    cumulativeGpa: s.cgpa,
    totalCredits: 12,
    generatedDate: date(2026, 1, 5),
  }));
  await prisma.transcript.createMany({ data: transcripts, skipDuplicates: true });
  log("Transcripts", transcripts.length);
}

async function seedStudentFeeReports(prisma: DbClient, ctx: SeedContext) {
  section("Student Fee Reports (Spring 2026)");

  const feeReports: Array<any> = [];
  let counter = 0;
  for (const s of ctx.students) {
    const semNum = s.level * 2 - 1;
    const feeId = ctx.feeIdByKey.get(`${s.programLevelId}:${semNum}`);
    if (!feeId) continue;
    counter++;
    feeReports.push({
      studentId: s.userId,
      programLevelId: s.programLevelId,
      semesterId: ctx.currentSemesterId,
      feeId,
      amount: 5000 + (s.level * 500),
      status: (counter % 3 === 0 ? "Paid" : "Pending") as any,
      generatedDate: date(2026, 1, 10),
    });
  }
  await prisma.studentFeeReport.createMany({ data: feeReports, skipDuplicates: true });
  log("StudentFeeReports", feeReports.length);
}

async function seedAttendanceSessions(prisma: DbClient, ctx: SeedContext) {
  section("Attendance Sessions & Student Attendance");

  // Take the first 5 slots of the current semester
  const sampleSlots = ctx.slots.slice(0, 5);

  const sessions: Array<any> = [];
  const attendance: Array<any> = [];
  let sessCounter = 0;

  for (const slot of sampleSlots) {
    sessCounter++;
    const session = await prisma.attendanceSession.create({
      data: {
        scheduleSlotId: slot.slotId,
        facultyMemberId: slot.teacherId,
        sessionDate: date(2026, 2, 5 + sessCounter),
        startTime: time(9, 0),
        endTime: time(11, 0),
        attendanceMode: "QRCode" as any,
        hotspotSsid: null,
        qrCode: `QR-${sessCounter}-${slot.slotId}`,
        sessionNotes: "Auto-seeded attendance session.",
      },
    });

    // Find registered students for this slot's context
    const regs = await prisma.courseRegistration.findMany({
      where: { slotContextId: slot.contextId, semesterId: ctx.currentSemesterId },
      select: { studentId: true },
    });
    regs.forEach((r) => {
      const r2 = (r.studentId + sessCounter) % 20;
      const status =
        r2 < 16 ? "Present" :
        r2 < 18 ? "Absent"  :
        r2 < 19 ? "Late"    : "Excused";
      attendance.push({
        attendanceSessionId: session.id,
        studentId: r.studentId,
        status: status as any,
        recordedAt: NOW,
        deviceIp: null,
        deviceMac: null,
        notes: null,
        isOfflineSync: false,
        syncedAt: null,
      });
    });
  }

  log("AttendanceSessions", sessCounter);

  await prisma.studentAttendance.createMany({ data: attendance, skipDuplicates: true });
  log("StudentAttendance", attendance.length);
}

async function seedAttendanceReports(prisma: DbClient, ctx: SeedContext) {
  section("Attendance Reports");

  const reports: Array<any> = [];
  for (const slot of ctx.slots) {
    const regs = await prisma.courseRegistration.findMany({
      where: { slotContextId: slot.contextId, semesterId: ctx.currentSemesterId },
      select: { studentId: true },
    });
    regs.forEach((r) => {
      const totalSessions = 10;
      const attended = 7 + ((r.studentId + slot.slotId) % 4);
      reports.push({
        courseId: slot.courseId,
        studentId: r.studentId,
        totalSessions,
        attendedSessions: attended,
        attendancePercentage: +((attended / totalSessions) * 100).toFixed(2),
        reportPeriodStart: date(2026, 2, 1),
        reportPeriodEnd:   date(2026, 6, 30),
        generatedAt: NOW,
      });
    });
  }
  await prisma.attendanceReport.createMany({ data: reports, skipDuplicates: true });
  log("AttendanceReports", reports.length);
}

async function seedLearningGroups(prisma: DbClient, ctx: SeedContext) {
  section("Learning Groups (Spring 2026)");

  // Group by courseId (one group per course per semester)
  const courseSlotMap = new Map<number, typeof ctx.slots>();
  ctx.slots.forEach((s) => {
    const arr = courseSlotMap.get(s.courseId) ?? [];
    arr.push(s);
    courseSlotMap.set(s.courseId, arr);
  });

  const members: Array<any> = [];
  const comments: Array<any> = [];

  let groupCount = 0;
  let postCount = 0;

  for (const [courseId, slots] of courseSlotMap) {
    const slot = slots[0];
    // Create group — capture generated ID
    const group = await prisma.learningGroup.create({
      data: {
        courseId,
        semesterId: ctx.currentSemesterId,
        groupName: `Group — Course ${courseId} (Spring 2026)`,
        accessCode: `GC${courseId}${ctx.currentSemesterId}`,
        allowStudentPosts: true,
      },
    });
    groupCount++;

    // Teacher as Owner
    members.push({
      learningGroupId: group.id,
      userId: slot.teacherId,
      role: "Owner" as any,
      joinedAt: NOW,
    });

    // Registered students as Members
    const regs = await prisma.courseRegistration.findMany({
      where: { slotContextId: slot.contextId, semesterId: ctx.currentSemesterId },
      select: { studentId: true },
    });
    regs.forEach((r) => {
      members.push({
        learningGroupId: group.id,
        userId: r.studentId,
        role: "Member" as any,
        joinedAt: NOW,
      });
    });

    // 2 posts by the teacher — use create() to capture post ID for comment
    const post1 = await prisma.learningGroupPost.create({
      data: {
        learningGroupId: group.id,
        authorId: slot.teacherId,
        postType: "ANNOUNCEMENT" as any,
        content: `Welcome to the learning group for course ${courseId}. Please review the syllabus.`,
        isPinned: true,
      },
    });
    postCount++;

    const post2 = await prisma.learningGroupPost.create({
      data: {
        learningGroupId: group.id,
        authorId: slot.teacherId,
        postType: "ASSIGNMENT" as any,
        content: `Assignment 1 — due next week. Submit via the LMS.`,
        dueDate: date(2026, 3, 15),
      },
    });
    postCount++;

    // 1 comment from the first student member
    if (regs.length > 0) {
      comments.push({
        postId: post1.id,
        authorId: regs[0].studentId,
        content: "Thank you, professor! Looking forward to the course.",
      });
    }
  }

  log("LearningGroups", groupCount);

  await prisma.learningGroupMember.createMany({ data: members, skipDuplicates: true });
  log("LearningGroupMembers", members.length);

  log("LearningGroupPosts", postCount);

  await prisma.learningGroupPostComment.createMany({ data: comments, skipDuplicates: true });
  log("LearningGroupPostComments", comments.length);
}

async function seedAnnouncements(prisma: DbClient, ctx: SeedContext) {
  section("Announcements");

  const announcements = [
    { title: "Welcome to the Spring 2026 Semester",      content: "Classes began on January 15th. Please check your schedule on the student portal.", type: "ANNOUNCEMENT" as const, audience: "ALL" as const,      authorIdx: 0 },
    { title: "Mid-Term Exams Schedule",                  content: "Mid-term exams will be held during the week of March 23rd. Detailed schedule to follow.", type: "ANNOUNCEMENT" as const, audience: "STUDENTS" as const, authorIdx: 1 },
    { title: "Faculty Meeting — Engineering",            content: "All Engineering faculty staff are invited to the annual meeting on March 10th, 2 PM, Auditorium A-001.", type: "EVENT" as const, audience: "STAFF" as const, authorIdx: 1, eventDate: date(2026, 3, 10), eventLocation: "Auditorium A-001" },
    { title: "Library Extended Hours During Finals",     content: "The main library will be open 24/7 from June 25th to July 5th to support finals preparation.", type: "ANNOUNCEMENT" as const, audience: "ALL" as const, authorIdx: 2 },
    { title: "Career Fair — Summer 2026",                content: "Save the date: the annual career fair will be held on July 15th, 2026. Employers from across the region will be on campus.", type: "EVENT" as const, audience: "STUDENTS" as const, authorIdx: 3, eventDate: date(2026, 7, 15), eventLocation: "Main Campus Quad" },
  ];

  await prisma.announcement.createMany({
    data: announcements.map((a) => ({
      title: a.title,
      content: a.content,
      type: a.type as any,
      audience: a.audience as any,
      status: "PUBLISHED" as any,
      eventDate: "eventDate" in a ? a.eventDate : null,
      eventLocation: "eventLocation" in a ? a.eventLocation : null,
      authorId: ctx.staffUserIds[a.authorIdx],
    })),
    skipDuplicates: true,
  });
  log("Announcements", announcements.length);
}

// ============================================================================
// MAIN
// ============================================================================

async function seed(schemaName: string): Promise<void> {
  console.log("=".repeat(72));
  console.log(`  Seeding schema: ${schemaName}`);
  console.log("=".repeat(72));

  const prisma = GetTenantClient(schemaName);
  const ctx = newSeedContext();

  // Run all seeds in dependency order
  await seedRolesAndPermissions(prisma, ctx);
  await seedRootAndAdminUsers(prisma, ctx);
  await seedStaffUsers(prisma, ctx);
  await seedFacultiesAndPrograms(prisma, ctx);
  await seedProgramLevelsAndLoads(prisma, ctx);
  await seedSemesters(prisma, ctx);
  await seedCoursesAndProgramCourses(prisma, ctx);
  await seedClassrooms(prisma, ctx);
  await seedScheduleSlotsAndContexts(prisma, ctx);
  await seedStudentUsers(prisma, ctx);
  await seedUserRoles(prisma, ctx);
  await seedCourseAssessments(prisma, ctx);
  await seedCourseRegistrationsAndGrades(prisma, ctx);
  await seedTranscripts(prisma, ctx);
  await seedStudentFeeReports(prisma, ctx);
  await seedAttendanceSessions(prisma, ctx);
  await seedAttendanceReports(prisma, ctx);
  await seedLearningGroups(prisma, ctx);
  await seedAnnouncements(prisma, ctx);

  console.log("");
  console.log("=".repeat(72));
  console.log(`  ✅ Seeding complete for schema: ${schemaName}`);
  console.log("=".repeat(72));
}

async function main() {
  const schemaName = process.argv[2];

  if (!schemaName) {
    console.error("❌ Usage: ts-node seeding.ts <schema_name>");
    console.error("   Example: ts-node seeding.ts alex_university");
    process.exit(1);
  }

  try {
    await seed(schemaName.trim());
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

main();
