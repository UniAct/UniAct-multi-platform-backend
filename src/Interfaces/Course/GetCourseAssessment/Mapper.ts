import { Prisma } from "@prisma/client";

type GetCourseAssessmentResult = Prisma.CourseAssessmentGetPayload<{
  select: {
    id:             true;
    label:          true;
    assessmentType: true;
    marks:          true;
  };
}>;

export function MapGetCourseAssessment(raw: GetCourseAssessmentResult[]) {
  return raw.map((assessment) => ({
    assessmentId:   assessment.id,
    label:          assessment.label,
    assessmentType: assessment.assessmentType,
    maxMarks:       Number(assessment.marks),
  }));
}