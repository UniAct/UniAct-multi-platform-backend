import { CourseRepository } from "../../../Repositories/CourseRepository";

type GetAllStaffCourses = Awaited<ReturnType<typeof CourseRepository.GetAllStaffCourses>>;

export function MapGetAllStaffCourses(raw: GetAllStaffCourses) {
  return raw.map((slot) => ({
    courseId:       slot.course.id,
    courseName:     slot.course.name,
    courseCode:     slot.course.code,
    courseCredits:  slot.course.credits,
    description:    slot.course.description,
  }));
}