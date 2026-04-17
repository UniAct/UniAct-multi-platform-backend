import { EnrollInScheduleRequestDto } from "./EnrollInScheduleSchema";

export type EnrollmentJobMessage = {
  jobId: string;
  schemaName: string;
  studentId: number;
  programLevelId : number;
  semesterId: number;
  schedule: EnrollInScheduleRequestDto;
};