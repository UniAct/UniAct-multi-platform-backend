export type TranscriptDto = {
  id: number;
  studentId: number;
  semesterId: number;
  semester: TranscriptSemesterInfoDto | null;
  year: number;
  semesterGpa: number;
  cumulativeGpa: number;
  totalCredits: number;
  generatedDate: string;
  courses: TranscriptCourseDto[];
};

export type StudentTranscriptSemestersDto = {
  studentId: number;
  semesters: TranscriptDto[];
};

export type TranscriptSemesterInfoDto = {
  id: number;
  year: number;
  term: number;
  type: string;
  startDate: string;
  endDate: string;
};

export type TranscriptCourseDto = {
  registrationId: number;
  courseCode: string | null;
  courseName: string | null;
  credits: number;
  grade: string | null;
  gradePoints: number | null;
  status: string;
  totalMarks: number;
  totalMaxMarks: number;
  scorePercentage: number | null;
};

export type TranscriptBatchGenerationSummaryDto = {
  jobId: string;
  totalStudents: number;
};
