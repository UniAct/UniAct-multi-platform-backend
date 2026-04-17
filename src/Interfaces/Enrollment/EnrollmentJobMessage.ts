import { EnrollInScheduleRequestDto } from "./EnrollInScheduleSchema";

export type EnrollmentJobMessage = {
  jobId: string;
  schemaName: string;
  studentId: number;
  currentStudentProgramLevelId : number;
  currentSemesterId: number;
  studentProgramId: number;
  schedule: EnrollInScheduleRequestDto;
};