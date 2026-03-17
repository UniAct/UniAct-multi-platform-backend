import { BlockReasonType, CourseType, FeeType, ProgramType, ResultDisplayType } from "@prisma/client";

export interface ProgramFeeInput {
  feeType: FeeType;
  semesterNumber?: number;
  amount: number;
  description?: string;
}

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

export interface ProgramTranscriptDefinitionInput {
  minScore: number;
  maxScore: number;
  minGPA: number;
  maxGPA: number;
  gradeLetter: string;
  equivalentEstimate?: string;
}

export interface AcademicLoadSemesterInput {
  level: number;
  semester: number;
  minCredits: number;
  maxCredits: number;
}

export interface AcademicLoadGPAInput {
  minGPA: number;
  maxGPA: number;
  minCredits: number;
  maxCredits: number;
}

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
