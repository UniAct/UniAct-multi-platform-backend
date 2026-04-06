import { BlockReasonType, CourseType, ProgramType, Prisma, ResultDisplayType, ClassroomType } from "@prisma/client";

type ProgramFeeBase = Pick<Prisma.FeeCreateManyInput, "feeType" | "amount" | "description">;

// semesterNumber is API-specific metadata used to map fees to template semesters.
export type ProgramFeeInput = ProgramFeeBase & {
  semesterNumber?: number;
};

export interface ProgramLevelInput {
  level: number;
  minCredits: number;
  maxCredits: number;
  fees?: ProgramFeeInput[];
  semesterFees?: {
    semester1?: ProgramFeeInput[];
    semester2?: ProgramFeeInput[];
  };
  summerFees?: ProgramFeeInput[];
}

// The minGPA/maxGPA designation was intentionally retained for ease of use of the API and was bound to Prisma minGpa/maxGpa at the service layer.
export type ProgramTranscriptDefinitionInput = {
  minScore: number;
  maxScore: number;
  minGPA: number;
  maxGPA: number;
  gradeLetter: string;
  equivalentEstimate?: string;
};

export interface AcademicLoadSemesterInput {
  level: number;
  semester: number;
  minCredits: number;
  maxCredits: number;
}

// The minGPA/maxGPA designation was intentionally retained for ease of use of the API and was bound to Prisma minGpa/maxGpa at the service layer.
export type AcademicLoadGPAInput = {
  minGPA: number;
  maxGPA: number;
  minCredits: number;
  maxCredits: number;
};

export interface ProgramUpsertInput {
  facultyId: number;
  name: string;
  description?: string;
  headId?: number;
  phone?: string;
  universityCreditHours?: number;
  facultyCreditHours?: number;
  programCreditHours?: number;
  programType: ProgramType;
  resultDisplay?: ResultDisplayType;
  blockReason?: BlockReasonType;
  levelsNumber?: number;
  levels?: ProgramLevelInput[];
  transcriptDefinition?: ProgramTranscriptDefinitionInput[];
  academicLoadSemester?: AcademicLoadSemesterInput[];
  academicLoadGPA?: AcademicLoadGPAInput[];
}

export interface CourseUpsertInput {
  name: string;
  code: string;
  description?: string;
  credits: number;
  syllabus?: string;
  successPercentage?: number;
  minFinalSuccessPercentage?: number;
  totalFail?: boolean;
  programId: number;
  courseType: CourseType;
  prerequisiteIds?: number[];
}

export interface ClassroomUpsertInput {
  roomNumber: string;
  building: string;
  capacity: number;
  type: ClassroomType;
  isAvailable?: boolean;
}
