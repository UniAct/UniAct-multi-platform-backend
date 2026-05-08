import { Prisma } from "@prisma/client";

type UpdateCourseAssessmentResult = Prisma.CourseAssessmentGetPayload<{
  select: {
    id:             true;
    label:          true;
    assessmentType: true;
    marks:          true;
  };
}>;

export function MapUpdateCourseAssessment(raw: UpdateCourseAssessmentResult[]) {
  return raw.map((assessment) => ({
    assessmentId:   assessment.id,
    label:          assessment.label,
    assessmentType: assessment.assessmentType,
    maxMarks:       Number(assessment.marks),
  }));
}