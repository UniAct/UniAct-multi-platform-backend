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
 *
 *  ----------------------------------------------------------------------------
 *  DEFAULT PASSWORDS (plaintext — each user record also has a comment above it)
 *  ----------------------------------------------------------------------------
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
 *      - The Root role is intentionally NOT assigned to any seeded user —
 *        it is reserved for the root account, which lives in the `public`
 *        schema as a SuperAdmin. The role is still seeded into the tenant
 *        schema so it can be granted manually if ever needed.
 *
 *  Data Volume (approximate):
 *      - 4 Faculties
 *      - 12 Programs (3 per faculty)
 *      - 40 Staff users (4 deans + 12 program heads + 24 teachers)
 *      - 120 Student users (10 per program)
 *      - 48 Program Levels (4 per program)
 *      - 10 Semesters (tracking history from Fall 2022 → Fall 2025)
 *      - 96 Courses (8 per program, distributed across levels)
 *      - 10 Classrooms
 *      - 4 Regulations + Mercy Rules
 *      - Program Transcript Definitions, Academic Loads, Fees
 *      - Schedule Slots + Contexts (current semester)
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

// Default plaintext passwords (also documented per-user in the arrays below).
const PWD_DEAN = "Dean@2025";
const PWD_HEAD = "Head@2025";
const PWD_TEACHER = "Teacher@2025";
const PWD_STUDENT = "Student@2025";

const NOW = new Date();

// Small helper to build Date objects for date-only columns
const date = (y: number, m: number, d: number) => new Date(y, m - 1, d);

// Small helper to build Date objects for time-only columns (@db.Time)
// Prisma accepts a full Date for Time fields — only the time portion is used.
const time = (h: number, m: number) =>
  new Date(1970, 0, 1, h, m, 0, 0);

// ============================================================================
// DATA DEFINITIONS
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
  // Course templates — 2 courses per level (8 total for a 4-year program)
  courses: Array<{ code: string; name: string; credits: number; level: number; type: "Mandatory" | "Elective" | "Project" }>;
}

const PROGRAMS_BY_FACULTY: ProgramDef[][] = [
  // Faculty 1 — CS & AI
  [
    {
      name: "Cyber Security",
      description: "Bachelor of Cyber Security — 4-year program.",
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
      name: "Intelligent Systems",
      description: "Bachelor of Intelligent Systems — 4-year program.",
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
      name: "Software Engineering",
      description: "Bachelor of Software Engineering — 4-year program.",
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
      name: "Civil Engineering",
      description: "Bachelor of Civil Engineering — 5-year program.",
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
      name: "Mechanical Engineering",
      description: "Bachelor of Mechanical Engineering — 5-year program.",
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
      name: "Electrical Engineering",
      description: "Bachelor of Electrical Engineering — 5-year program.",
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
      name: "Physics",
      description: "Bachelor of Physics — 4-year program.",
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
      name: "Chemistry",
      description: "Bachelor of Chemistry — 4-year program.",
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
      name: "Mathematics",
      description: "Bachelor of Mathematics — 4-year program.",
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
      name: "Business Administration",
      description: "Bachelor of Business Administration — 4-year program.",
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
      name: "Accounting",
      description: "Bachelor of Accounting — 4-year program.",
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
      name: "Marketing",
      description: "Bachelor of Marketing — 4-year program.",
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

// 10 Semesters — history from Fall 2022 → Fall 2025
const SEMESTERS: Array<{
  id: number;
  year: number;
  term: number; // 1=Fall, 2=Spring, 3=Summer
  startDate: Date;
  endDate: Date;
  type: "Fall" | "Spring" | "Summer";
}> = [
  { id: 1,  year: 2022, term: 1, startDate: date(2022, 9, 1),  endDate: date(2022, 12, 31), type: "Fall"   },
  { id: 2,  year: 2023, term: 2, startDate: date(2023, 1, 15), endDate: date(2023, 5, 31),  type: "Spring" },
  { id: 3,  year: 2023, term: 3, startDate: date(2023, 6, 15), endDate: date(2023, 8, 15),  type: "Summer" },
  { id: 4,  year: 2023, term: 1, startDate: date(2023, 9, 1),  endDate: date(2023, 12, 31), type: "Fall"   },
  { id: 5,  year: 2024, term: 2, startDate: date(2024, 1, 15), endDate: date(2024, 5, 31),  type: "Spring" },
  { id: 6,  year: 2024, term: 3, startDate: date(2024, 6, 15), endDate: date(2024, 8, 15),  type: "Summer" },
  { id: 7,  year: 2024, term: 1, startDate: date(2024, 9, 1),  endDate: date(2024, 12, 31), type: "Fall"   },
  { id: 8,  year: 2025, term: 2, startDate: date(2025, 1, 15), endDate: date(2025, 5, 31),  type: "Spring" },
  { id: 9,  year: 2025, term: 3, startDate: date(2025, 6, 15), endDate: date(2025, 8, 15),  type: "Summer" },
  { id: 10, year: 2025, term: 1, startDate: date(2025, 9, 1),  endDate: date(2025, 12, 31), type: "Fall"   },
];

// The "current" semester — used for active registrations, schedule, attendance, etc.
const CURRENT_SEMESTER_ID = 10;

// Classrooms (10)
const CLASSROOMS = [
  { id: 1,  classroomNumber: "H-101", building: "Main Building",  capacity: 120, type: "Hall"      as const, underMaintenance: false },
  { id: 2,  classroomNumber: "H-102", building: "Main Building",  capacity: 120, type: "Hall"      as const, underMaintenance: false },
  { id: 3,  classroomNumber: "H-201", building: "Main Building",  capacity: 80,  type: "Hall"      as const, underMaintenance: false },
  { id: 4,  classroomNumber: "H-202", building: "Main Building",  capacity: 80,  type: "Hall"      as const, underMaintenance: false },
  { id: 5,  classroomNumber: "L-101", building: "Lab Building",   capacity: 40,  type: "Lab"       as const, underMaintenance: false },
  { id: 6,  classroomNumber: "L-102", building: "Lab Building",   capacity: 40,  type: "Lab"       as const, underMaintenance: false },
  { id: 7,  classroomNumber: "L-201", building: "Lab Building",   capacity: 30,  type: "Lab"       as const, underMaintenance: false },
  { id: 8,  classroomNumber: "A-001", building: "Auditorium",     capacity: 300, type: "Auditorium" as const, underMaintenance: false },
  { id: 9,  classroomNumber: "A-002", building: "Auditorium",     capacity: 250, type: "Auditorium" as const, underMaintenance: false },
  { id: 10, classroomNumber: "H-301", building: "Main Building",  capacity: 60,  type: "Hall"      as const, underMaintenance: true  },
];

// Roles
// NOTE: Root (id=1) represents the root account and has every permission.
//       Admin (id=2) is the tenant administrator (also has every permission,
//       but is scoped to the tenant schema, not the cross-tenant `public` schema).
const ROLES = [
  { id: 1, name: "Root",        description: "Root account — unrestricted access to every resource in the tenant schema." },
  { id: 2, name: "Admin",       description: "Tenant administrator with full access to all tenant resources." },
  { id: 3, name: "Dean",        description: "Faculty dean — manages a faculty and its programs." },
  { id: 4, name: "ProgramHead", description: "Head of an academic program." },
  { id: 5, name: "Teacher",     description: "Teaching staff member." },
  { id: 6, name: "Student",     description: "Enrolled student." },
];

// Permissions (33 total — grouped by resource for readability)
// IDs 1–4    : role
// IDs 5–9    : account
// IDs 10–13  : faculty
// IDs 14–17  : program
// IDs 18–21  : course
// IDs 22–24  : courseAssessment
// IDs 25–28  : semester
// IDs 29–32  : classroom
// ID  33     : schedule
const PERMISSIONS = [
  // role
  { id: 1,  name: "role.create",              description: "Create new roles and assign permissions to them" },
  { id: 2,  name: "role.read",                description: "View and list all roles with their assigned permissions" },
  { id: 3,  name: "role.update",              description: "Modify existing roles and update their permissions" },
  { id: 4,  name: "role.delete",              description: "Delete roles and remove their associated permissions" },
  // account
  { id: 5,  name: "account.create",           description: "Create new user accounts" },
  { id: 6,  name: "account.read",             description: "View user account details and information" },
  { id: 7,  name: "account.update",           description: "Update user account information" },
  { id: 8,  name: "account.delete",           description: "Delete user accounts from the system" },
  { id: 9,  name: "account.assign_role",      description: "Assign one or more roles to a user account" },
  // faculty
  { id: 10, name: "faculty.create",           description: "Create a new faculty" },
  { id: 11, name: "faculty.read",             description: "View faculty details and list all faculties" },
  { id: 12, name: "faculty.update",           description: "Update existing faculty information" },
  { id: 13, name: "faculty.delete",           description: "Delete a faculty from the system" },
  // program
  { id: 14, name: "program.create",           description: "Create a new program" },
  { id: 15, name: "program.read",             description: "View program details and list all programs" },
  { id: 16, name: "program.update",           description: "Update existing program information" },
  { id: 17, name: "program.delete",           description: "Delete a program from the system" },
  // course
  { id: 18, name: "course.create",            description: "Create a new course" },
  { id: 19, name: "course.read",              description: "View course details and list all courses" },
  { id: 20, name: "course.update",            description: "Update existing course information" },
  { id: 21, name: "course.delete",            description: "Delete a course from the system" },
  // courseAssessment
  { id: 22, name: "courseAssessment.create",  description: "Create a new assessment for a specific course" },
  { id: 23, name: "courseAssessment.read",    description: "View assessment details and retrieve all assessments associated with a specific course" },
  { id: 24, name: "courseAssessment.update",  description: "Modify an existing assessment for a specific course" },
  // semester
  { id: 25, name: "semester.create",          description: "Create a new academic semester" },
  { id: 26, name: "semester.read",            description: "View semester details and list all semesters" },
  { id: 27, name: "semester.update",          description: "Update existing semester information" },
  { id: 28, name: "semester.delete",          description: "Delete a semester from the system" },
  // classroom
  { id: 29, name: "classroom.create",         description: "Create a new classroom" },
  { id: 30, name: "classroom.read",           description: "View classroom details and list all classrooms" },
  { id: 31, name: "classroom.update",         description: "Update existing classroom information" },
  { id: 32, name: "classroom.delete",         description: "Delete a classroom from the system" },
  // schedule
  { id: 33, name: "schedule.enroll",          description: "Enroll a student into a specific schedule" },
];

// All permission IDs (used by Root + Admin)
const ALL_PERMISSION_IDS = PERMISSIONS.map((p) => p.id);

// Role → Permission mapping
// Role IDs: 1=Root, 2=Admin, 3=Dean, 4=ProgramHead, 5=Teacher, 6=Student
const ROLE_PERMISSIONS: Array<[number, number]> = [
  // Root → every permission
  ...ALL_PERMISSION_IDS.map((pid): [number, number] => [1, pid]),

  // Admin → every permission
  ...ALL_PERMISSION_IDS.map((pid): [number, number] => [2, pid]),

  // Dean → manage faculty/program, read everything else, assign roles, enroll
  [3, 2],  // role.read
  [3, 6],  // account.read
  [3, 7],  // account.update
  [3, 9],  // account.assign_role
  [3, 11], // faculty.read
  [3, 12], // faculty.update
  [3, 15], // program.read
  [3, 16], // program.update
  [3, 19], // course.read
  [3, 23], // courseAssessment.read
  [3, 26], // semester.read
  [3, 30], // classroom.read
  [3, 33], // schedule.enroll

  // ProgramHead → manage courses/assessments, read program/faculty, enroll
  [4, 2],  // role.read
  [4, 6],  // account.read
  [4, 11], // faculty.read
  [4, 15], // program.read
  [4, 16], // program.update
  [4, 18], // course.create
  [4, 19], // course.read
  [4, 20], // course.update
  [4, 22], // courseAssessment.create
  [4, 23], // courseAssessment.read
  [4, 24], // courseAssessment.update
  [4, 26], // semester.read
  [4, 30], // classroom.read
  [4, 33], // schedule.enroll

  // Teacher → manage assessments, read courses/programs, enroll
  [5, 6],  // account.read
  [5, 11], // faculty.read
  [5, 15], // program.read
  [5, 19], // course.read
  [5, 22], // courseAssessment.create
  [5, 23], // courseAssessment.read
  [5, 24], // courseAssessment.update
  [5, 26], // semester.read
  [5, 30], // classroom.read
  [5, 33], // schedule.enroll

  // Student → read courses/assessments/semesters, enroll
  [6, 6],  // account.read (self)
  [6, 19], // course.read
  [6, 23], // courseAssessment.read
  [6, 26], // semester.read
  [6, 33], // schedule.enroll
];

// Staff user templates (40 users: 4 deans + 12 heads + 24 teachers)
// id 1-4   : Deans       (password: Dean@2025)
// id 5-16  : Program Heads (password: Head@2025)
// id 17-40 : Teachers    (password: Teacher@2025)
interface StaffUserDef {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  dob: Date;
  address: string;
  city: string;
  nationalId: string;
  position: string;       // Staff.position
  hireDate: Date;
  salary: number;
  role: "Dean" | "ProgramHead" | "Teacher";
}

const STAFF_USERS: StaffUserDef[] = [];

// Pool of staff name fragments — used to synthesise plausible names
const FIRST_NAMES = ["Ahmed","Mohamed","Mahmoud","Omar","Youssef","Karim","Hassan","Ali","Mostafa","Amr","Tarek","Sherif","Nour","Sara","Mona","Dina","Hala","Reem","Mariam","Yara","Heba","Noha","Salma","Farida","Lamia","Adel","Sami","Ramy","Fathy","Khaled","Tamer","Wael","Emad","Hossam","Ibrahim","Nabil"];
const LAST_NAMES  = ["Mansour","Barakat","Abdel-Rahman","Seif","Hassan","Sami","Fouad","Adel","Saber","Lotfy","Salah","Ghareeb","Mahmoud","El-Sayed","Abdo","Khalil","Rezk","Saad","Awad","Nasr","Younes","Zaki","Taha","Bassiouni","Hamdy","Sobhy","Galal","Ezzat","Roshdy","Badran"];

// Build deans (ids 1-4)
FACULTIES.forEach((fac, i) => {
  STAFF_USERS.push({
    id: i + 1,
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

// Build program heads (ids 5-16) — one per program
let staffIdx = 5;
let nameIdx = 0;
PROGRAMS_BY_FACULTY.flat().forEach((prog, _i) => {
  const fn = FIRST_NAMES[nameIdx % FIRST_NAMES.length];
  const ln = LAST_NAMES[(nameIdx + 3) % LAST_NAMES.length];
  nameIdx++;
  STAFF_USERS.push({
    id: staffIdx++,
    firstName: fn,
    lastName: ln,
    phone: `010${String(20000000 + staffIdx * 137).slice(0, 8)}`,
    dob: date(1978 + (staffIdx % 5), (staffIdx % 12) + 1, (staffIdx % 27) + 1),
    address: `${staffIdx * 11} El Geish Road, Alexandria`,
    city: "Alexandria",
    nationalId: `2850${String(1000000000 + staffIdx * 9876543).slice(0, 10)}`,
    position: "Program Head",
    hireDate: date(2014, 2, 1),
    salary: 25000,
    role: "ProgramHead",
  });
});

// Build teachers (ids 17-40) — 2 per program → 24 teachers
let teacherIdx = 17;
PROGRAMS_BY_FACULTY.flat().forEach((_prog, i) => {
  for (let t = 0; t < 2; t++) {
    const fn = FIRST_NAMES[(i * 2 + t + 5) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 2 + t + 7) % LAST_NAMES.length];
    STAFF_USERS.push({
      id: teacherIdx,
      firstName: fn,
      lastName: ln,
      phone: `011${String(50000000 + teacherIdx * 311).slice(0, 8)}`,
      dob: date(1982 + (teacherIdx % 4), ((teacherIdx + 1) % 12) + 1, ((teacherIdx + 2) % 27) + 1),
      address: `${teacherIdx * 7} Smouha, Alexandria`,
      city: "Alexandria",
      nationalId: `2900${String(2000000000 + teacherIdx * 1234567).slice(0, 10)}`,
      position: t === 0 ? "Lecturer" : "Assistant Professor",
      hireDate: date(2017, 9, 1),
      salary: 18000 + (t * 2000),
      role: "Teacher",
    });
    teacherIdx++;
  }
});

// Student template generation — 10 students per program → 120 students (ids 41-160)
const STUDENT_FIRST_NAMES_M = ["Ahmed","Mohamed","Mahmoud","Omar","Youssef","Karim","Hassan","Ali","Mostafa","Amr","Tarek","Sherif","Khaled","Adel","Sami","Tamer","Wael","Emad","Hossam","Ibrahim","Nabil","Maged","Ramy","Said","Farouk"];
const STUDENT_FIRST_NAMES_F = ["Nour","Sara","Mona","Dina","Hala","Reem","Mariam","Yara","Heba","Noha","Salma","Farida","Lamia","Aya","Esraa","Doaa","Menna","Shahenda","Asmaa","Manar","Norhan","Walaa","Mervat","Samar","Hend"];
const STUDENT_LAST_NAMES  = ["Hassan","Sami","Fouad","Adel","Saber","Lotfy","Salah","Ghareeb","Mahmoud","El-Sayed","Abdo","Khalil","Rezk","Saad","Awad","Nasr","Younes","Zaki","Taha","Bassiouni","Hamdy","Sobhy","Galal","Ezzat","Roshdy","Badran","Mansour","Barakat","Seif","Salem"];
const CITIES = ["Alexandria","Cairo","Giza","Mansoura","Tanta","Port Said","Suez","Asyut"];

interface StudentUserDef {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  dob: Date;
  address: string;
  city: string;
  nationalId: string;
  // Student-specific
  universityStudentId: number;
  programId: number;
  enrollmentDate: Date;
  cgpa: number;
  programLevelId: number;
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
  let sid = 41;
  let uniId = 20220001;
  let programIdx = 0;
  PROGRAMS_BY_FACULTY.flat().forEach((prog, pIdx) => {
    for (let i = 0; i < 10; i++) {
      const gender: "M" | "F" = i % 2 === 0 ? "M" : "F";
      const fn = gender === "M"
        ? STUDENT_FIRST_NAMES_M[(pIdx * 10 + i) % STUDENT_FIRST_NAMES_M.length]
        : STUDENT_FIRST_NAMES_F[(pIdx * 10 + i) % STUDENT_FIRST_NAMES_F.length];
      const ln = STUDENT_LAST_NAMES[(pIdx * 10 + i) % STUDENT_LAST_NAMES.length];
      const cgpa = +(2.0 + ((pIdx * 13 + i * 7) % 21) / 10).toFixed(4); // 2.0 → 4.0
      // Students who started 4 years ago should be at level 4 now; vary it for realism
      const level = ((i % 4) + 1);
      // programLevelId: program pIdx × 4 levels + (level - 1) + 1
      const programLevelId = pIdx * 4 + level;
      STUDENT_USERS.push({
        id: sid,
        firstName: fn,
        lastName: ln,
        phone: `010${String(60000000 + sid * 211).slice(0, 8)}`,
        dob: date(2002 + (sid % 3), ((sid + 1) % 12) + 1, ((sid + 2) % 27) + 1),
        address: `${sid * 5} ${CITIES[sid % CITIES.length]} St.`,
        city: CITIES[sid % CITIES.length],
        nationalId: `2980${String(3000000000 + sid * 7654321).slice(0, 10)}`,
        universityStudentId: uniId,
        programId: pIdx + 1,
        enrollmentDate: date(2022, 9, 1),
        cgpa,
        programLevelId,
        religion: (sid % 10 === 0) ? "C" : "M",
        gender,
        fullname: `${fn} ${ln}`,
        homePhone: `02${String(30000000 + sid * 1234).slice(0, 8)}`,
        previousQualification: "Thanaweya Amma",
        secondarySchoolName: `${CITIES[sid % CITIES.length]} Secondary School`,
        totalHighSchoolGrades: +(75 + ((sid * 7) % 24)).toFixed(2),
        highSchoolSeatNumber: String(100000 + sid * 137),
        status: "New",
      });
      sid++;
      uniId++;
    }
    programIdx++;
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

async function seedRolesAndPermissions(prisma: DbClient) {
  section("Roles & Permissions");

  await prisma.role.createMany({
    data: ROLES,
    skipDuplicates: true,
  });
  log("Roles", ROLES.length);

  await prisma.permission.createMany({
    data: PERMISSIONS,
    skipDuplicates: true,
  });
  log("Permissions", PERMISSIONS.length);

  await prisma.rolePermission.createMany({
    data: ROLE_PERMISSIONS.map(([roleId, permissionId]) => ({ roleId, permissionId })),
    skipDuplicates: true,
  });
  log("RolePermissions", ROLE_PERMISSIONS.length);
}

async function seedStaffUsers(prisma: DbClient) {
  section("Staff Users (Deans / Program Heads / Teachers)");

  // Hash each role's password once
  const hashDean    = await hashPassword(PWD_DEAN);
  const hashHead    = await hashPassword(PWD_HEAD);
  const hashTeacher = await hashPassword(PWD_TEACHER);

  const users = STAFF_USERS.map((s) => {
    // Plaintext password comment is documented per-role at the top of the file
    // and inline below in the source array. The bcrypt hash is chosen by role.
    const passwordHash =
      s.role === "Dean"        ? hashDean :
      s.role === "ProgramHead" ? hashHead :
                                 hashTeacher;
    const username = `${s.role.toLowerCase()}.${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}.${s.id}`;
    const email = `${username}@alexu.edu.eg`;
    return {
      id: s.id,
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
  log("Staff Users", users.length);

  // Staff records
  const staff = STAFF_USERS.map((s) => ({
    userId: s.id,
    position: s.position,
    hireDate: s.hireDate,
    salary: s.salary,
  }));
  await prisma.staff.createMany({ data: staff, skipDuplicates: true });
  log("Staff records", staff.length);
}

async function seedFacultiesAndPrograms(prisma: DbClient) {
  section("Faculties, Programs, ProgramStaff, Regulations");

  // Faculties (ids 1-4). Dean is staff id = faculty index.
  await prisma.faculty.createMany({
    data: FACULTIES.map((f, i) => ({
      id: i + 1,
      universityId: 1, // adjust if your tenant has a specific university record
      name: f.name,
      description: f.description,
      deanId: i + 1, // staff id (dean)
      establishedDate: date(1960 + i * 5, 9, 1),
    })),
    skipDuplicates: true,
  });
  log("Faculties", FACULTIES.length);

  // Programs (ids 1-12)
  const programs: Array<any> = [];
  let progId = 1;
  let headStaffId = 5; // heads are staff ids 5-16
  PROGRAMS_BY_FACULTY.forEach((facultyPrograms, facIdx) => {
    facultyPrograms.forEach((p) => {
      programs.push({
        id: progId,
        facultyId: facIdx + 1,
        name: p.name,
        description: p.description,
        headId: headStaffId,
        phone: p.phone,
        universityCreditHours: p.universityCreditHours,
        facultyCreditHours: p.facultyCreditHours,
        programCreditHours: p.programCreditHours,
        durationYears: p.durationYears,
        programType: p.programType as any,
        resultDisplay: "CourseGrade" as const,
      });
      progId++;
      headStaffId++;
    });
  });
  await prisma.program.createMany({ data: programs, skipDuplicates: true });
  log("Programs", programs.length);

  // ProgramStaff — link heads + teachers to their programs
  const programStaff: Array<any> = [];
  let psId = 1;
  let teacherStaffId = 17; // teachers are staff ids 17-40
  for (let pId = 1; pId <= 12; pId++) {
    const facId = Math.ceil(pId / 3);
    // head of this program is staff id 5 + (pId - 1)
    programStaff.push({
      id: psId++,
      staffId: 5 + (pId - 1),
      programId: pId,
      facultyId: facId,
    });
    // 2 teachers per program
    for (let t = 0; t < 2; t++) {
      programStaff.push({
        id: psId++,
        staffId: teacherStaffId++,
        programId: pId,
        facultyId: facId,
      });
    }
  }
  await prisma.programStaff.createMany({ data: programStaff, skipDuplicates: true });
  log("ProgramStaff", programStaff.length);

  // Regulations (1 per faculty) + Mercy Rules
  const regulations = FACULTIES.map((f, i) => ({
    id: i + 1,
    facultyId: i + 1,
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
  }));
  await prisma.regulation.createMany({ data: regulations, skipDuplicates: true });
  log("Regulations", regulations.length);

  // Mercy rules — 3 per regulation
  const mercyRules: Array<any> = [];
  let mrId = 1;
  regulations.forEach((r) => {
    [
      { original: 48, adjusted: 50 },
      { original: 57, adjusted: 60 },
      { original: 67, adjusted: 70 },
    ].forEach((m) => {
      mercyRules.push({
        id: mrId++,
        regulationId: r.id,
        originalScore: m.original,
        adjustedScore: m.adjusted,
      });
    });
  });
  await prisma.mercyRule.createMany({ data: mercyRules, skipDuplicates: true });
  log("MercyRules", mercyRules.length);
}

async function seedProgramLevelsAndLoads(prisma: DbClient) {
  section("Program Levels, Academic Loads, Transcript Definitions, Fees");

  // Program Levels — 4 per program → 48 levels
  const programLevels: Array<any> = [];
  let plId = 1;
  for (let pId = 1; pId <= 12; pId++) {
    for (let lvl = 1; lvl <= 4; lvl++) {
      programLevels.push({
        id: plId++,
        programId: pId,
        level: lvl,
        minCredits: 12,
        maxCredits: 21,
      });
    }
  }
  await prisma.programLevel.createMany({ data: programLevels, skipDuplicates: true });
  log("ProgramLevels", programLevels.length);

  // Academic Load Semesters — for each program × level × semester number (1..8)
  const academicLoadSemesters: Array<any> = [];
  let alsId = 1;
  for (let pId = 1; pId <= 12; pId++) {
    for (let lvl = 1; lvl <= 4; lvl++) {
      const programLevelId = (pId - 1) * 4 + lvl;
      for (let semNum = 1; semNum <= 8; semNum++) {
        academicLoadSemesters.push({
          id: alsId++,
          programId: pId,
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

  // Academic Load GPAs — 3 ranges per program
  const academicLoadGpas: Array<any> = [];
  let algId = 1;
  for (let pId = 1; pId <= 12; pId++) {
    [
      { min: 0.0,  max: 2.0,  minCr: 12, maxCr: 15 },
      { min: 2.0,  max: 3.0,  minCr: 15, maxCr: 18 },
      { min: 3.0,  max: 4.0,  minCr: 18, maxCr: 21 },
    ].forEach((g) => {
      academicLoadGpas.push({
        id: algId++,
        programId: pId,
        minGpa: g.min,
        maxGpa: g.max,
        minCredits: g.minCr,
        maxCredits: g.maxCr,
      });
    });
  }
  await prisma.academicLoadGPA.createMany({ data: academicLoadGpas, skipDuplicates: true });
  log("AcademicLoadGPAs", academicLoadGpas.length);

  // Program Transcript Definitions — standard grade scale per program
  // (5 grade buckets per program for brevity)
  const grades: Array<{ letter: any; min: number; max: number; est: string; minGpa: number; maxGpa: number }> = [
    { letter: "A",      min: 90, max: 100, est: "Excellent",   minGpa: 3.7, maxGpa: 4.0 },
    { letter: "B",      min: 80, max: 89,  est: "Very Good",   minGpa: 3.0, maxGpa: 3.69 },
    { letter: "C",      min: 70, max: 79,  est: "Good",        minGpa: 2.4, maxGpa: 2.99 },
    { letter: "D",      min: 60, max: 69,  est: "Acceptable",  minGpa: 2.0, maxGpa: 2.39 },
    { letter: "F",      min: 0,  max: 59,  est: "Fail",        minGpa: 0.0, maxGpa: 1.99 },
  ];
  const transcriptDefs: Array<any> = [];
  let tdId = 1;
  for (let pId = 1; pId <= 12; pId++) {
    grades.forEach((g) => {
      transcriptDefs.push({
        id: tdId++,
        programId: pId,
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

  // Fees — per program level × semester number (1..8), ConstantSemester type
  const fees: Array<any> = [];
  let feeId = 1;
  for (let pId = 1; pId <= 12; pId++) {
    for (let lvl = 1; lvl <= 4; lvl++) {
      const programLevelId = (pId - 1) * 4 + lvl;
      for (let semNum = 1; semNum <= 8; semNum++) {
        fees.push({
          id: feeId++,
          programLevelId,
          semesterNumber: semNum,
          feeType: "ConstantSemester",
          amount: 5000 + (lvl * 500),
          description: `Semester ${semNum} tuition — Level ${lvl}`,
        });
      }
    }
  }
  await prisma.fee.createMany({ data: fees, skipDuplicates: true });
  log("Fees", fees.length);
}

async function seedSemesters(prisma: DbClient) {
  section("Semesters (Tracking History)");

  await prisma.semester.createMany({
    data: SEMESTERS.map((s) => ({
      id: s.id,
      year: s.year,
      term: s.term,
      startDate: s.startDate,
      endDate: s.endDate,
      type: s.type as any,
    })),
    skipDuplicates: true,
  });
  log("Semesters", SEMESTERS.length);
}

async function seedCoursesAndProgramCourses(prisma: DbClient) {
  section("Courses, ProgramCourses, Prerequisites");

  // Courses — 8 per program → 96 courses (ids 1-96)
  const courses: Array<any> = [];
  const programCourses: Array<any> = [];
  let courseId = 1;
  let pcId = 1;

  PROGRAMS_BY_FACULTY.flat().forEach((prog, pIdx) => {
    const programId = pIdx + 1;
    prog.courses.forEach((c) => {
      courses.push({
        id: courseId,
        name: c.name,
        code: c.code,
        description: `${c.name} — ${c.credits} credit hours.`,
        credits: c.credits,
        syllabus: `Syllabus for ${c.name}. Topics covered: core concepts, applications, and assessments.`,
        successPercentage: 60,
        totalFail: false,
        minFinalSuccessPercentage: 50,
      });

      // ProgramCourse — link course to its program level
      const programLevelId = (programId - 1) * 4 + c.level;
      programCourses.push({
        id: pcId++,
        programId,
        programLevelId,
        courseId,
        type: c.type as any,
      });
      courseId++;
    });
  });

  await prisma.course.createMany({ data: courses, skipDuplicates: true });
  log("Courses", courses.length);

  await prisma.programCourse.createMany({ data: programCourses, skipDuplicates: true });
  log("ProgramCourses", programCourses.length);

  // Prerequisites — for each program, the level-2 course 0 requires level-1 course 1, etc.
  const prereqs: Array<any> = [];
  PROGRAMS_BY_FACULTY.flat().forEach((prog, pIdx) => {
    const baseCourseId = pIdx * 8 + 1; // first course id of this program
    // Level 2 course → requires Level 1 course
    prereqs.push({ courseId: baseCourseId + 2, prerequisiteId: baseCourseId + 0 });
    prereqs.push({ courseId: baseCourseId + 3, prerequisiteId: baseCourseId + 1 });
    // Level 3 → requires Level 2
    prereqs.push({ courseId: baseCourseId + 4, prerequisiteId: baseCourseId + 2 });
    prereqs.push({ courseId: baseCourseId + 5, prerequisiteId: baseCourseId + 3 });
    // Level 4 → requires Level 3
    prereqs.push({ courseId: baseCourseId + 6, prerequisiteId: baseCourseId + 4 });
    prereqs.push({ courseId: baseCourseId + 7, prerequisiteId: baseCourseId + 5 });
  });
  await prisma.coursePrerequisite.createMany({ data: prereqs, skipDuplicates: true });
  log("CoursePrerequisites", prereqs.length);
}

async function seedClassrooms(prisma: DbClient) {
  section("Classrooms");
  await prisma.classroom.createMany({
    data: CLASSROOMS.map((c) => ({
      id: c.id,
      classroomNumber: c.classroomNumber,
      building: c.building,
      capacity: c.capacity,
      type: c.type as any,
      underMaintenance: c.underMaintenance,
    })),
    skipDuplicates: true,
  });
  log("Classrooms", CLASSROOMS.length);
}

async function seedScheduleSlotsAndContexts(prisma: DbClient) {
  section("Schedule Slots & Contexts (current semester)");

  // For each program, schedule the 2 level-1 courses in the current semester.
  // We pick a teacher from this program (head or teacher) and an available classroom.
  const slots: Array<any> = [];
  const slotContexts: Array<any> = [];
  let slotId = 1;
  let ctxId = 1;

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday"] as const;
  const timePairs = [
    { s: time(9, 0),  e: time(11, 0) },
    { s: time(11, 0), e: time(13, 0) },
    { s: time(14, 0), e: time(16, 0) },
  ];

  PROGRAMS_BY_FACULTY.flat().forEach((prog, pIdx) => {
    const programId = pIdx + 1;
    const facId = Math.ceil(programId / 3);
    const headStaffId = 5 + pIdx;            // head
    const teacherStaffId = 17 + pIdx * 2;    // first teacher of this program

    // For each level-1 course in this program (courses 0 and 1 of the program)
    prog.courses.slice(0, 2).forEach((c, ci) => {
      const courseId = pIdx * 8 + ci + 1;
      const classroomId = ((slotId - 1) % 9) + 1; // rotate through classrooms 1..9
      const day = days[(slotId - 1) % days.length];
      const tp = timePairs[(slotId - 1) % timePairs.length];
      const teacherId = ci === 0 ? headStaffId : teacherStaffId;

      slots.push({
        id: slotId,
        teacherId,
        courseId,
        classroomId,
        semesterId: CURRENT_SEMESTER_ID,
        dayOfWeek: day as any,
        startTime: tp.s,
        endTime: tp.e,
        type: ci === 0 ? "Lecture" : "Tutorial",
        allowedCapacity: 120,
        enrolledSeats: 0,
      });

      // ScheduleSlotContext — link to the program at level 1
      slotContexts.push({
        id: ctxId++,
        slotId,
        programId,
        academicLevel: 1,
        semesterId: CURRENT_SEMESTER_ID,
      });
      slotId++;
    });
  });

  await prisma.scheduleSlot.createMany({ data: slots, skipDuplicates: true });
  log("ScheduleSlots", slots.length);

  await prisma.scheduleSlotContext.createMany({ data: slotContexts, skipDuplicates: true });
  log("ScheduleSlotContexts", slotContexts.length);
}

async function seedStudentUsers(prisma: DbClient) {
  section("Student Users + Student Records");

  const hashStudent = await hashPassword(PWD_STUDENT);

  const users = STUDENT_USERS.map((s) => {
    // Plaintext password: Student@2025
    const username = `student.${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}.${s.id}`;
    const email = `${username}@alexu.edu.eg`;
    return {
      id: s.id,
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
  log("Student Users", users.length);

  const students = STUDENT_USERS.map((s) => ({
    userId: s.id,
    universityStudentId: s.universityStudentId,
    programId: s.programId,
    status: s.status as any,
    enrollmentDate: s.enrollmentDate,
    cgpa: s.cgpa,
    homePhone: s.homePhone,
    previousQualification: s.previousQualification,
    secondarySchoolName: s.secondarySchoolName,
    totalHighSchoolGrades: s.totalHighSchoolGrades,
    highSchoolSeatNumber: s.highSchoolSeatNumber,
    programLevelId: s.programLevelId,
    religion: s.religion,
    gender: s.gender,
    fullname: s.fullname,
  }));
  await prisma.student.createMany({ data: students, skipDuplicates: true });
  log("Student records", students.length);
}

async function seedUserRoles(prisma: DbClient) {
  section("User Roles");

  const userRoles: Array<any> = [];

  // Role IDs (see ROLES above):
  //   1 = Root, 2 = Admin, 3 = Dean, 4 = ProgramHead, 5 = Teacher, 6 = Student
  //
  // The Root role (id=1) is intentionally NOT assigned to any seeded user —
  // it is reserved for the root account (which lives in the `public` schema
  // as a SuperAdmin). The role is still created here so it can be granted
  // manually to a tenant user if ever needed.

  // Deans (staff 1-4) → role 3 (Dean)
  for (let id = 1; id <= 4; id++) userRoles.push({ userId: id, roleId: 3 });
  // Program Heads (staff 5-16) → role 4 (ProgramHead)
  for (let id = 5; id <= 16; id++) userRoles.push({ userId: id, roleId: 4 });
  // Teachers (staff 17-40) → role 5 (Teacher)
  for (let id = 17; id <= 40; id++) userRoles.push({ userId: id, roleId: 5 });
  // Students (users 41-160) → role 6 (Student)
  for (let id = 41; id <= 160; id++) userRoles.push({ userId: id, roleId: 6 });

  await prisma.userRole.createMany({ data: userRoles, skipDuplicates: true });
  log("UserRoles", userRoles.length);
}

async function seedCourseAssessments(prisma: DbClient) {
  section("Course Assessments (current semester)");

  // For each scheduled course in current semester, create 3 assessments
  // (Quiz, Midterm, Final)
  const slots = await prisma.scheduleSlot.findMany({
    where: { semesterId: CURRENT_SEMESTER_ID },
    select: { id: true, courseId: true },
  });

  const assessments: Array<any> = [];
  let aId = 1;
  slots.forEach((slot) => {
    [
      { label: "Quiz 1",     type: "Quiz",       marks: 10 },
      { label: "Midterm",    type: "Midterm",    marks: 30 },
      { label: "Final Exam", type: "Final",      marks: 60 },
    ].forEach((a) => {
      assessments.push({
        id: aId++,
        courseId: slot.courseId,
        semesterId: CURRENT_SEMESTER_ID,
        label: a.label,
        assessmentType: a.type as any,
        marks: a.marks,
      });
    });
  });

  await prisma.courseAssessment.createMany({ data: assessments, skipDuplicates: true });
  log("CourseAssessments", assessments.length);
}

async function seedCourseRegistrationsAndGrades(prisma: DbClient) {
  section("Course Registrations & Grades (current + past semester)");

  const PAST_SEM_ID = 8; // Spring 2025 — used for completed grades/transcripts

  // ------------------------------------------------------------------
  // 1. Build a programId → slotContexts[] map (using CURRENT-sem contexts)
  // ------------------------------------------------------------------
  const ctxs = await prisma.scheduleSlotContext.findMany({
    where: { semesterId: CURRENT_SEMESTER_ID },
    select: { id: true, programId: true, slotId: true },
  });
  const ctxsByProgram = new Map<number, typeof ctxs>();
  ctxs.forEach((c) => {
    const arr = ctxsByProgram.get(c.programId) ?? [];
    arr.push(c);
    ctxsByProgram.set(c.programId, arr);
  });

  // ------------------------------------------------------------------
  // 2. Current-semester registrations (status: InProgress)
  // ------------------------------------------------------------------
  const currentRegs: Array<any> = [];
  let regId = 1;
  STUDENT_USERS.forEach((s) => {
    const ctxsForProgram = ctxsByProgram.get(s.programId) ?? [];
    ctxsForProgram.forEach((ctx) => {
      currentRegs.push({
        id: regId++,
        studentId: s.id,
        semesterId: CURRENT_SEMESTER_ID,
        enrollmentDate: date(2025, 9, 15),
        status: "InProgress" as const,
        slotContextId: ctx.id,
      });
    });
  });
  await prisma.courseRegistration.createMany({ data: currentRegs, skipDuplicates: true });
  log(`CourseRegistrations (Semester ${CURRENT_SEMESTER_ID})`, currentRegs.length);

  // ------------------------------------------------------------------
  // 3. Past-semester assessments (one Quiz + Midterm + Final per course)
  // ------------------------------------------------------------------
  const scheduledCourseIds = await prisma.scheduleSlot.findMany({
    where: { semesterId: CURRENT_SEMESTER_ID },
    select: { courseId: true },
    distinct: ["courseId"],
  });

  const pastAssessments: Array<any> = [];
  let paId = 1000; // start past-sem assessment IDs at 1000 to avoid collision with current-sem ones (1..72)
  scheduledCourseIds.forEach((sc) => {
    [
      { label: "Quiz 1",     type: "Quiz",    marks: 10 },
      { label: "Midterm",    type: "Midterm", marks: 30 },
      { label: "Final Exam", type: "Final",   marks: 60 },
    ].forEach((a) => {
      pastAssessments.push({
        id: paId++,
        courseId: sc.courseId,
        semesterId: PAST_SEM_ID,
        label: a.label,
        assessmentType: a.type as any,
        marks: a.marks,
      });
    });
  });
  await prisma.courseAssessment.createMany({ data: pastAssessments, skipDuplicates: true });
  log(`CourseAssessments (Semester ${PAST_SEM_ID})`, pastAssessments.length);

  // ------------------------------------------------------------------
  // 4. Past-semester registrations (status: Completed, grade: B)
  //    We reuse current-semester slotContext IDs — the FK is satisfied
  //    and the unique key (studentId, slotContextId, semesterId) is
  //    different because semesterId differs.
  // ------------------------------------------------------------------
  const pastRegs: Array<any> = [];
  STUDENT_USERS.forEach((s) => {
    const ctxsForProgram = ctxsByProgram.get(s.programId) ?? [];
    ctxsForProgram.forEach((ctx) => {
      pastRegs.push({
        id: regId++,
        studentId: s.id,
        semesterId: PAST_SEM_ID,
        enrollmentDate: date(2025, 2, 1),
        status: "Completed" as const,
        grade: "B" as any,
        gradePoints: 3.0,
        slotContextId: ctx.id,
      });
    });
  });
  await prisma.courseRegistration.createMany({ data: pastRegs, skipDuplicates: true });
  log(`CourseRegistrations (Semester ${PAST_SEM_ID})`, pastRegs.length);

  // ------------------------------------------------------------------
  // 5. Build a slotContextId → courseId map (using CURRENT-sem data,
  //    because past registrations reference current-sem contexts)
  // ------------------------------------------------------------------
  const currentSlots = await prisma.scheduleSlot.findMany({
    where: { semesterId: CURRENT_SEMESTER_ID },
    select: { id: true, courseId: true },
  });
  const slotIdToCourseId = new Map<number, number>();
  currentSlots.forEach((s) => slotIdToCourseId.set(s.id, s.courseId));

  const currentCtxs = await prisma.scheduleSlotContext.findMany({
    where: { semesterId: CURRENT_SEMESTER_ID },
    select: { id: true, slotId: true },
  });
  const ctxIdToCourseId = new Map<number, number>();
  currentCtxs.forEach((c) => {
    const cid = slotIdToCourseId.get(c.slotId);
    if (cid != null) ctxIdToCourseId.set(c.id, cid);
  });

  // ------------------------------------------------------------------
  // 6. Build a courseId → assessments[] map (using PAST-sem assessments)
  // ------------------------------------------------------------------
  const pastAssessmentsFromDb = await prisma.courseAssessment.findMany({
    where: { semesterId: PAST_SEM_ID },
    select: { id: true, courseId: true, marks: true },
  });
  const assessmentsByCourse = new Map<number, typeof pastAssessmentsFromDb>();
  pastAssessmentsFromDb.forEach((a) => {
    const arr = assessmentsByCourse.get(a.courseId) ?? [];
    arr.push(a);
    assessmentsByCourse.set(a.courseId, arr);
  });

  // ------------------------------------------------------------------
  // 7. Create Grade rows — one per (past registration × assessment)
  // ------------------------------------------------------------------
  const grades: Array<any> = [];
  let gId = 1;
  pastRegs.forEach((reg) => {
    const courseId = ctxIdToCourseId.get(reg.slotContextId);
    if (courseId == null) return;
    const assess = assessmentsByCourse.get(courseId) ?? [];
    assess.forEach((a) => {
      // Deterministic pseudo-random mark between 40% and 95% of max.
      // a.marks is a Prisma.Decimal — convert to number via toString() first.
      const maxMarksNum = Number(a.marks.toString());
      const pct = 0.4 + ((reg.id * 7 + a.id * 3) % 56) / 100;
      const marks = +(maxMarksNum * pct).toFixed(2);
      grades.push({
        id: gId++,
        courseRegistrationId: reg.id,
        courseAssessmentId: a.id,
        marks,
        maxMarks: a.marks, // pass the original Decimal straight through for storage
        assessmentDate: date(2025, 4, 15),
        comments: "Auto-seeded grade.",
      });
    });
  });
  await prisma.grade.createMany({ data: grades, skipDuplicates: true });
  log("Grades (past semester)", grades.length);
}

async function seedTranscripts(prisma: DbClient) {
  section("Transcripts (past semester)");

  // One transcript per student for the past semester (id 8)
  const PAST_SEM_ID = 8;
  const transcripts: Array<any> = [];
  let tId = 1;
  STUDENT_USERS.forEach((s) => {
    transcripts.push({
      id: tId++,
      studentId: s.id,
      semesterId: PAST_SEM_ID,
      year: 2025,
      semesterGpa: s.cgpa,
      cumulativeGpa: s.cgpa,
      totalCredits: 12,
      generatedDate: date(2025, 6, 5),
    });
  });
  await prisma.transcript.createMany({ data: transcripts, skipDuplicates: true });
  log("Transcripts", transcripts.length);
}

async function seedStudentFeeReports(prisma: DbClient) {
  section("Student Fee Reports (current semester)");

  // For each student, generate one fee report for the current semester
  // by looking up the appropriate Fee for their program level & semester number.
  const feeReports: Array<any> = [];
  let frId = 1;

  // Build (programLevelId, semesterNumber) → feeId lookup. semesterNumber derived from level (1..4) × 2 - 1
  const fees = await prisma.fee.findMany({ select: { id: true, programLevelId: true, semesterNumber: true, amount: true } });

  STUDENT_USERS.forEach((s) => {
    // semesterNumber guess: students at level L are roughly in semester (L*2 - 1)
    const semNum = ((s.programLevelId - 1) % 4) * 2 + 1;
    const fee = fees.find((f) => f.programLevelId === s.programLevelId && f.semesterNumber === semNum);
    if (!fee) return;
    feeReports.push({
      id: frId++,
      studentId: s.id,
      programLevelId: s.programLevelId,
      semesterId: CURRENT_SEMESTER_ID,
      feeId: fee.id,
      amount: fee.amount,
      status: (frId % 3 === 0 ? "Paid" : "Pending") as any,
      generatedDate: date(2025, 9, 5),
    });
  });

  await prisma.studentFeeReport.createMany({ data: feeReports, skipDuplicates: true });
  log("StudentFeeReports", feeReports.length);
}

async function seedAttendanceSessions(prisma: DbClient) {
  section("Attendance Sessions & Student Attendance");

  // Take the first 5 schedule slots of the current semester and create 1 session each
  const slots = await prisma.scheduleSlot.findMany({
    where: { semesterId: CURRENT_SEMESTER_ID },
    take: 5,
    include: { slotContext: true },
  });

  const sessions: Array<any> = [];
  const attendance: Array<any> = [];
  let sessId = 1;
  let attId = 1;

  for (const slot of slots) {
    sessions.push({
      id: sessId,
      scheduleSlotId: slot.id,
      facultyMemberId: slot.teacherId,
      sessionDate: date(2025, 10, 5 + sessId),
      startTime: slot.startTime,
      endTime: slot.endTime,
      attendanceMode: "QRCode" as any,
      hotspotSsid: null,
      qrCode: `QR-${sessId}-${slot.id}`,
      sessionNotes: "Auto-seeded attendance session.",
    });

    // For each student registered in this slot's context, record attendance
    const ctx = slot.slotContext[0];
    if (ctx) {
      const regs = await prisma.courseRegistration.findMany({
        where: { slotContextId: ctx.id, semesterId: CURRENT_SEMESTER_ID },
        select: { studentId: true },
      });
      regs.forEach((r) => {
        // Random-ish status — 80% Present, 10% Absent, 5% Late, 5% Excused
        const r2 = (r.studentId + sessId) % 20;
        const status =
          r2 < 16 ? "Present" :
          r2 < 18 ? "Absent"  :
          r2 < 19 ? "Late"    : "Excused";
        attendance.push({
          id: attId++,
          attendanceSessionId: sessId,
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
    sessId++;
  }

  await prisma.attendanceSession.createMany({ data: sessions, skipDuplicates: true });
  log("AttendanceSessions", sessions.length);

  await prisma.studentAttendance.createMany({ data: attendance, skipDuplicates: true });
  log("StudentAttendance", attendance.length);
}

async function seedAttendanceReports(prisma: DbClient) {
  section("Attendance Reports");

  // Build a simple attendance report per (course, student) for the current semester
  // For each course in the current semester schedule, gather its students and produce a report.
  const slots = await prisma.scheduleSlot.findMany({
    where: { semesterId: CURRENT_SEMESTER_ID },
    include: { slotContext: true },
  });

  const reports: Array<any> = [];
  let rId = 1;

  for (const slot of slots) {
    const ctx = slot.slotContext[0];
    if (!ctx) continue;
    const regs = await prisma.courseRegistration.findMany({
      where: { slotContextId: ctx.id, semesterId: CURRENT_SEMESTER_ID },
      select: { studentId: true },
    });
    regs.forEach((r) => {
      const totalSessions = 10;
      const attended = 7 + ((r.studentId + slot.id) % 4); // 7..10
      reports.push({
        id: rId++,
        courseId: slot.courseId,
        studentId: r.studentId,
        totalSessions,
        attendedSessions: attended,
        attendancePercentage: +((attended / totalSessions) * 100).toFixed(2),
        reportPeriodStart: date(2025, 9, 1),
        reportPeriodEnd:   date(2025, 12, 31),
        generatedAt: NOW,
      });
    });
  }

  await prisma.attendanceReport.createMany({ data: reports, skipDuplicates: true });
  log("AttendanceReports", reports.length);
}

async function seedLearningGroups(prisma: DbClient) {
  section("Learning Groups (current semester)");

  // One learning group per scheduled course in the current semester
  const slots = await prisma.scheduleSlot.findMany({
    where: { semesterId: CURRENT_SEMESTER_ID },
    select: { id: true, courseId: true, teacherId: true },
    distinct: ["courseId"],
  });

  const groups: Array<any> = [];
  const members: Array<any> = [];
  const posts: Array<any> = [];
  const comments: Array<any> = [];
  let gId = 1;
  let pId = 1;
  let cId = 1;

  for (const slot of slots) {
    const groupName = `Group — Course ${slot.courseId} (Semester ${CURRENT_SEMESTER_ID})`;
    const accessCode = `GC${slot.courseId}${CURRENT_SEMESTER_ID}`;
    groups.push({
      id: gId,
      courseId: slot.courseId,
      semesterId: CURRENT_SEMESTER_ID,
      groupName,
      accessCode,
      allowStudentPosts: true,
    });

    // Add the teacher as Owner
    members.push({
      learningGroupId: gId,
      userId: slot.teacherId,
      role: "Owner" as any,
      joinedAt: NOW,
    });

    // Add registered students as Members
    const ctxs = await prisma.scheduleSlotContext.findMany({
      where: { slotId: slot.id, semesterId: CURRENT_SEMESTER_ID },
      select: { id: true },
    });
    for (const c of ctxs) {
      const regs = await prisma.courseRegistration.findMany({
        where: { slotContextId: c.id, semesterId: CURRENT_SEMESTER_ID },
        select: { studentId: true },
      });
      regs.forEach((r) => {
        members.push({
          learningGroupId: gId,
          userId: r.studentId,
          role: "Member" as any,
          joinedAt: NOW,
        });
      });
    }

    // Add 2 posts by the teacher
    posts.push({
      id: pId++,
      learningGroupId: gId,
      authorId: slot.teacherId,
      postType: "ANNOUNCEMENT" as any,
      content: `Welcome to the learning group for course ${slot.courseId}. Please review the syllabus.`,
      isPinned: true,
    });
    posts.push({
      id: pId++,
      learningGroupId: gId,
      authorId: slot.teacherId,
      postType: "ASSIGNMENT" as any,
      content: `Assignment 1 — due next week. Submit via the LMS.`,
      dueDate: date(2025, 10, 15),
    });

    // Add 1 comment from the first student member
    const studentMembers = members.filter((m) => m.learningGroupId === gId && m.role === "Member");
    if (studentMembers.length > 0) {
      comments.push({
        id: cId++,
        postId: pId - 2,
        authorId: studentMembers[0].userId,
        content: "Thank you, professor! Looking forward to the course.",
      });
    }

    gId++;
  }

  await prisma.learningGroup.createMany({ data: groups, skipDuplicates: true });
  log("LearningGroups", groups.length);

  await prisma.learningGroupMember.createMany({ data: members, skipDuplicates: true });
  log("LearningGroupMembers", members.length);

  await prisma.learningGroupPost.createMany({ data: posts, skipDuplicates: true });
  log("LearningGroupPosts", posts.length);

  await prisma.learningGroupPostComment.createMany({ data: comments, skipDuplicates: true });
  log("LearningGroupPostComments", comments.length);
}

async function seedAnnouncements(prisma: DbClient) {
  section("Announcements");

  const announcements = [
    { title: "Welcome to the Fall 2025 Semester",        content: "Classes begin on September 1st. Please check your schedule on the student portal.", type: "ANNOUNCEMENT" as const, audience: "ALL" as const,      authorId: 1 },
    { title: "Mid-Term Exams Schedule",                  content: "Mid-term exams will be held during the week of November 3rd. Detailed schedule to follow.", type: "ANNOUNCEMENT" as const, audience: "STUDENTS" as const, authorId: 2 },
    { title: "Faculty Meeting — Engineering",            content: "All Engineering faculty staff are invited to the annual meeting on October 10th, 2 PM, Auditorium A-001.", type: "EVENT" as const, audience: "STAFF" as const, authorId: 2, eventDate: date(2025, 10, 10), eventLocation: "Auditorium A-001" },
    { title: "Library Extended Hours During Finals",     content: "The main library will be open 24/7 from December 15th to December 31st to support finals preparation.", type: "ANNOUNCEMENT" as const, audience: "ALL" as const, authorId: 3 },
    { title: "Career Fair — Spring 2026",                content: "Save the date: the annual career fair will be held on February 20th, 2026. Employers from across the region will be on campus.", type: "EVENT" as const, audience: "STUDENTS" as const, authorId: 4, eventDate: date(2026, 2, 20), eventLocation: "Main Campus Quad" },
  ];

  await prisma.announcement.createMany({
    data: announcements.map((a, i) => ({
      id: i + 1,
      title: a.title,
      content: a.content,
      type: a.type as any,
      audience: a.audience as any,
      status: "PUBLISHED" as any,
      eventDate: "eventDate" in a ? a.eventDate : null,
      eventLocation: "eventLocation" in a ? a.eventLocation : null,
      authorId: a.authorId,
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

  // Run all seeds in dependency order
  await seedRolesAndPermissions(prisma);
  await seedStaffUsers(prisma);
  await seedFacultiesAndPrograms(prisma);
  await seedProgramLevelsAndLoads(prisma);
  await seedSemesters(prisma);
  await seedCoursesAndProgramCourses(prisma);
  await seedClassrooms(prisma);
  await seedScheduleSlotsAndContexts(prisma);
  await seedStudentUsers(prisma);
  await seedUserRoles(prisma);
  await seedCourseAssessments(prisma);
  await seedCourseRegistrationsAndGrades(prisma);
  await seedTranscripts(prisma);
  await seedStudentFeeReports(prisma);
  await seedAttendanceSessions(prisma);
  await seedAttendanceReports(prisma);
  await seedLearningGroups(prisma);
  await seedAnnouncements(prisma);

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
