import { StudentStatus } from "@prisma/client";

export enum Gender {
  Male = 'M',
  Female = 'F'
}

export enum Religion {
  Muslim = 'M',
  Christian = 'C'
}

export interface CreateStudentRequest {
  username: string;
  firstName: string;
  lastName: string;
  fullname: string;
  universityStudentId: number;
  nationalId: string;
  programId: number;
  programLevelId: number;
  semesterId: number;
  email: string;
  phone: string;
  dateOfBirth: string; 
  address: string;
  city: string;
  country: string;
  status: StudentStatus;
  enrollmentDate: string; 
  religion: Religion;
  gender: Gender;
  homePhone?: string;
  previousQualification?: string; 
  secondarySchoolName?: string; 
  totalHighSchoolGrades?: number; 
  highSchoolSeatNumber?: string;
}

export interface BulkCreateResult {
  jobId: string;
  schemaName: string;
  objectName: string;
  programLevelId: string;
  programId: string;
  semesterId: string;
} 

export interface CreateStudentBulkRequest{
  programLevelId: string;
  programId: string;
  semesterId: string;
}

export interface FailedRow {
  row: number;
  data: Record<string, any>;
  reason: string;
}