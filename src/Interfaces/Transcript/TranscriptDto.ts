export type TranscriptDto = {
  id: number;
  studentId: number;
  semesterId: number;
  year: number;
  semesterGpa: number;
  cumulativeGpa: number;
  totalCredits: number;
  generatedDate: string;
};

export type TranscriptGenerationSummaryDto = {
  semesterId: number;
  totalStudents: number;
  queuedCount: number;
  queuedJobs: Array<{
    studentId: number;
    jobId: string;
  }>;
};

export type TranscriptJobQueuedDto = {
  studentId: number;
  semesterId: number;
  jobId: string;
};

export type TranscriptBatchGenerationSummaryDto = {
  semesterId: number;
  facultyId: number;
  totalStudents: number;
  queuedCount: number;
  levelBreakdown: Array<{
    level: number;
    totalStudents: number;
  }>;
  queuedJobs: Array<{
    studentId: number;
    jobId: string;
    level: number;
  }>;
};
