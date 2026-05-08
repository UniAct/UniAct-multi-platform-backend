import { CourseRepository } from "../../../Repositories/CourseRepository";

type UpdateStudentGrade = Awaited<ReturnType<typeof CourseRepository.UpdateById>>;

export function MapUpdateStudentGrade(raw: UpdateStudentGrade) {
  return {
    gradeId:        raw.id,
    label:          raw.courseAssessment.label,
    assessmentType: raw.courseAssessment.assessmentType,
    maxMarks:       Number(raw.maxMarks),
    obtainedMarks:  Number(raw.marks),
  };
}