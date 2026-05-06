import { FeeType, GradeEnum, ProgramType, ResultDisplayType } from "@prisma/client";
import { z } from "zod/v4";
import { applyProgramRefinements } from "../utils";

const ProgramTypeSchema = z.enum(ProgramType, {
  error: `Program type must be one of: ${Object.values(ProgramType).join(", ")}`,
});

const GradeDisplayMap: Record<string, typeof GradeEnum[keyof typeof GradeEnum]> = {
  "A+": "A_PLUS",
  "A":  "A",
  "A-": "A_MINUS",
  "B+": "B_PLUS",
  "B":  "B",
  "B-": "B_MINUS",
  "C+": "C_PLUS",
  "C":  "C",
  "C-": "C_MINUS",
  "D+": "D_PLUS",
  "D":  "D",
  "F":  "F",
};

const GradeDisplayValues = Object.keys(GradeDisplayMap) as [string, ...string[]];

const ResultDisplayTypeSchema = z.enum(ResultDisplayType , {
  error: `Result display must be one of: ${Object.values(ResultDisplayType).join(", ")}`,
});

const FeeTypeSchema = z.enum(FeeType,
  {
    error:
      `Fee type must be one of: ${Object.values(FeeType).join(", ")}`,
  }
);


const FeeEntrySchema = z.object({
  id: z.number().int().optional(), // Added for non-destructive updates
  feeType: FeeTypeSchema,

  amount: z
    .number({ error: "Fee amount must be a number." })
    .positive("Fee amount must be greater than zero.")
    .min(1 , {error: "Fee amount must be between 100 and 1m"})
    .max(1_000_000 , {error: "Fee amount must be between 100 and 1m"}),

  description: z
    .string()
    .max(500, "Fee description must not exceed 500 characters.")
    .optional(),
});

const SemesterFeesSchema = z.object({
  semester1: z
    .array(FeeEntrySchema)
    .min(1, "Semester 1 must have at least one fee entry."),

  semester2: z
    .array(FeeEntrySchema)
    .min(1, "Semester 2 must have at least one fee entry."),
});

const ProgramLevelSchema = z
  .object({
    id: z.number().int().optional(), 

    level: z
      .number({ error: "Level number must be a numeric value." })
      .int("Level number must be a whole number.")
      .min(1, "Level number must be at least 1.")
      .max(7 , "level number must be 7 at most"),

    minCredits: z
      .number({ error: "Minimum credits must be a number." })
      .int("Minimum credits must be a whole number.")
      .min(1, "Minimum credits cannot be negative."),

    maxCredits: z
      .number({ error: "Maximum credits must be a number." })
      .int("Maximum credits must be a whole number.")
      .min(1, "Maximum credits cannot be negative."),

    // Added fees array for those not assigned to a specific semester
    fees: z.array(FeeEntrySchema).optional(),
    
    semesterFees: SemesterFeesSchema,

    summerFees: z.array(FeeEntrySchema),
  })
  .refine((data) => data.maxCredits >= data.minCredits, {
    message:
      "Maximum credits for a level must be greater than or equal to minimum credits.",
    path: ["maxCredits"],
  });


const TranscriptDefinitionEntrySchema = z
  .object({
    id: z.number().int().optional(), // Added

    gradeLetter: z.enum(GradeDisplayValues, {
      error: `Grade letter must be one of: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F`
    })
    .transform((val) => GradeDisplayMap[val]),
    
    minScore: z
      .number({ error: "Minimum score must be a number." })
      .min(0, "Minimum score cannot be negative.")
      .max(100, "Minimum score cannot exceed 100."),

    maxScore: z
      .number({ error: "Maximum score must be a number." })
      .min(0, "Maximum score cannot be negative.")
      .max(100, "Maximum score cannot exceed 100."),

    minGPA: z
      .number({ error: "Minimum GPA must be a number." })
      .min(0, "Minimum GPA cannot be negative.")
      .max(4.0, "Minimum GPA cannot exceed 4.0."),

    maxGPA: z
      .number({ error: "Maximum GPA must be a number." })
      .min(0, "Maximum GPA cannot be negative.")
      .max(4.0, "Maximum GPA cannot exceed 4.0."),

    equivalentEstimate: z
      .string()
      .max(20, "Equivalent estimate must not exceed 20 characters.")
      .optional(),
  })
  .refine((data) => data.maxScore >= data.minScore, {
    message:
      "Maximum score must be greater than or equal to the minimum score for this grade band.",
    path: ["maxScore"],
  })
  .refine((data) => data.maxGPA >= data.minGPA, {
    message:
      "Maximum GPA must be greater than or equal to the minimum GPA for this grade band.",
    path: ["maxGPA"],
  });


const AcademicLoadSemesterEntrySchema = z
  .object({
    id: z.number().int().optional(), // Added
    level: z
      .number({ error: "Academic load level must be a number." })
      .int("Academic load level must be a whole number.")
      .min(1, "Academic load level must be at least 1."),

    semester: z
      .number({ error: "Semester number must be a number." })
      .int("Semester number must be a whole number.")
      .min(1, "Semester number must be at least 1.")
      .max(3, "Semester number must not exceed 3 (1 = Fall, 2 = Spring, 3 = Summer)."),

    minCredits: z
      .number({ error: "Minimum credits must be a number." })
      .int("Minimum credits must be a whole number.")
      .min(0, "Minimum credits cannot be negative."),

    maxCredits: z
      .number({ error: "Maximum credits must be a number." })
      .int("Maximum credits must be a whole number.")
      .min(1, "Maximum credits must be at least 1."),
  })
  .refine((data) => data.maxCredits >= data.minCredits, {
    message:
      "Maximum credits for a semester load rule must be greater than or equal to minimum credits.",
    path: ["maxCredits"],
  });


const AcademicLoadGPAEntrySchema = z
  .object({
    id: z.number().int().optional(), // Added
    minGPA: z
      .number({ error: "Minimum GPA must be a number." })
      .min(0, "Minimum GPA cannot be negative.")
      .max(4.0, "Minimum GPA cannot exceed 4.0."),

    maxGPA: z
      .number({ error: "Maximum GPA must be a number." })
      .min(0, "Maximum GPA cannot be negative.")
      .max(4.0, "Maximum GPA cannot exceed 4.0."),

    minCredits: z
      .number({ error: "Minimum credits must be a number." })
      .int("Minimum credits must be a whole number.")
      .min(0, "Minimum credits cannot be negative."),

    maxCredits: z
      .number({ error: "Maximum credits must be a number." })
      .int("Maximum credits must be a whole number.")
      .min(1, "Maximum credits must be at least 1."),
  })
  .refine((data) => data.maxGPA >= data.minGPA, {
    message:
      "Maximum GPA must be greater than or equal to minimum GPA in this load rule.",
    path: ["maxGPA"],
  })
  .refine((data) => data.maxCredits >= data.minCredits, {
    message:
      "Maximum credits must be greater than or equal to minimum credits in this load rule.",
    path: ["maxCredits"],
  });

// Refined Egyptian Phone Regex: Handles 01x... and +201x...
const egyptianPhoneRegex = /^(?:\+20|0)?1[0125]\d{8}$/;

export const ProgramBaseSchema = z.object({
    name: z
      .string({ error: "Program name is required." })
      .min(2, "Program name must be at least 2 characters long.")
      .max(255, "Program name must not exceed 255 characters."),

    description: z
      .string()
      .max(2000, "Program description must not exceed 2000 characters.")
      .optional(),

    facultyId: z
      .number({ error: "Faculty ID is required and must be a number." })
      .int("Faculty ID must be a whole number.")
      .positive("Faculty ID must reference a valid faculty."),

    headId: z
      .number({ error: "Head ID must be a number." })
      .int("Head ID must be a whole number.")
      .positive("Head ID must reference a valid staff member.")
      .optional(),

    phone: z.string().regex(egyptianPhoneRegex, "Invalid Egyptian phone number").optional(),
    
    universityCreditHours: z
      .number({ error: "University credit hours must be a number." })
      .int("University credit hours must be a whole number.")
      .min(0, "University credit hours cannot be negative.")
      .default(0),

    facultyCreditHours: z
      .number({ error: "Faculty credit hours must be a number." })
      .int("Faculty credit hours must be a whole number.")
      .min(0, "Faculty credit hours cannot be negative.")
      .default(0),

    programCreditHours: z
      .number({ error: "Program credit hours must be a number." })
      .int("Program credit hours must be a whole number.")
      .min(0, "Program credit hours cannot be negative.")
      .default(0),

    programType: ProgramTypeSchema,

    resultDisplay: ResultDisplayTypeSchema.default("CourseGrade"),

    levelsNumber: z
      .number({ error: "Number of levels must be a number." })
      .int("Number of levels must be a whole number.")
      .min(1, "A program must have at least 1 level.")
      .max(10, "A program cannot have more than 10 levels."),

    levels: z
      .array(ProgramLevelSchema)
      .min(1, "At least one program level must be defined."),

    transcriptDefinition: z
      .array(TranscriptDefinitionEntrySchema)
      .min(1, "At least one transcript grade definition must be provided."),

    academicLoadSemester: z
      .array(AcademicLoadSemesterEntrySchema),

    academicLoadGPA: z
      .array(AcademicLoadGPAEntrySchema),
  });

  export const CreateProgramSchema = applyProgramRefinements(ProgramBaseSchema);

export type CreateProgramRequestDto = z.infer<typeof CreateProgramSchema>;