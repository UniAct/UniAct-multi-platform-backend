import { CourseRepository } from "../../../Repositories/CourseRepository";

type GetCourseStudents = Awaited<ReturnType<typeof CourseRepository.GetCourseStudents>>;

export function MapGetCourseStudents(raw: GetCourseStudents) {
  return raw.map((cr) => ({
    studentName:        `${cr.student.user.firstName} ${cr.student.user.lastName}`,
    universityStudentId: cr.student.universityStudentId,
    grades: cr.grades.map((g) => ({
      gradeId:       g.id,
      assessmentId:  g.courseAssessment.id,
      label:         g.courseAssessment.label,
      maxMarks:      Number(g.courseAssessment.marks),
      obtainedMarks: Number(g.marks),
    })),
  }));
}
