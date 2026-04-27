import { EnrollInScheduleRequestDto } from "./EnrollInScheduleSchema";

export type EnrollmentJobMessage = {
  jobId: string;
  schemaName: string;
  studentId: number;
  currentStudentProgramLevelId : number;
  semester: {
    id: number,
    term: number
  }
  studentProgramId: number;
  schedule: EnrollInScheduleRequestDto;
};