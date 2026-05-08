import { CourseRepository } from "../../../Repositories/CourseRepository";

type BulkCreateResult = Awaited<ReturnType<typeof CourseRepository.CourseAssessmentBulkCreate>>;

export function MapAssignCourseAssessment(raw: BulkCreateResult) {
  return raw.map((assessment) => ({
    assessmentId:   assessment.id,
    label:          assessment.label,
    assessmentType: assessment.assessmentType,
    marks:          Number(assessment.marks),
  }));
}