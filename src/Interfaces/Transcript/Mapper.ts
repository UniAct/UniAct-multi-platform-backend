import { Transcript } from "@prisma/client";
import { TranscriptCourseDto, TranscriptDto, TranscriptSemesterInfoDto } from "./TranscriptDto";

export function MapTranscript(
  raw: Transcript,
  courses: TranscriptCourseDto[] = [],
  semester: TranscriptSemesterInfoDto | null = null
): TranscriptDto {
  return {
    id: raw.id,
    studentId: raw.studentId,
    semesterId: raw.semesterId,
    semester,
    year: raw.year,
    semesterGpa: Number(raw.semesterGpa),
    cumulativeGpa: Number(raw.cumulativeGpa),
    totalCredits: raw.totalCredits,
    generatedDate: raw.generatedDate.toISOString(),
    courses,
  };
}
