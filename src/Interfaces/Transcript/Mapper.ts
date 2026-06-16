import { Transcript } from "@prisma/client";
import { TranscriptDto } from "./TranscriptDto";

export function MapTranscript(raw: Transcript): TranscriptDto {
  return {
    id: raw.id,
    studentId: raw.studentId,
    semesterId: raw.semesterId,
    year: raw.year,
    semesterGpa: Number(raw.semesterGpa),
    cumulativeGpa: Number(raw.cumulativeGpa),
    totalCredits: raw.totalCredits,
    generatedDate: raw.generatedDate.toISOString(),
  };
}
