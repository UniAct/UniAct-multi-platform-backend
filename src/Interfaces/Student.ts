import { StudentStatus } from "@prisma/client";

export enum Gender {
  Male = 'M',
  Female = 'F'
}

export enum Religion {
  Muslim = 'M',
  Christian = 'C'
}

export enum SortingOrder {
  Ascending = 'asc',
  Descending = 'desc'
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

export interface UpdateStudentRequest{
  username?: string;
  firstName?: string;
  lastName?: string;
  fullname?: string;
  universityStudentId?: number;
  nationalId?: string;
  programId?: number;
  programLevelId?: number;
  cgpa?: number;
  email?: string;
  phone?: string;
  dateOfBirth?: string; 
  address?: string;
  city?: string;
  country?: string;
  status?: StudentStatus;
  enrollmentDate?: string; 
  religion?: Religion;
  gender?: Gender;
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

export interface StudentQuery {
  // Pagination stuff
  page?:                number;
  limit?:               number;

  // Exact filters — student
  studentId?:           number;
  universityStudentId?: number;
  status?:              StudentStatus;
  gender?:              Gender;
  religion?:            Religion;
  programId?:           number;
  programLevelId?:      number;

  // Exact filters — user
  nationalId?:          string;
  city?:                string;
  country?:             string;
  isVerified?:          boolean;
  isBlocked?:           boolean;

  // Range filters
  cgpaMin?:             number;
  cgpaMax?:             number;
  enrollmentDateFrom?:  string;
  enrollmentDateTo?:    string;
  createdAtFrom?:       string;
  createdAtTo?:         string;

  // Sorting
  sortOrder?:           SortingOrder;
}
