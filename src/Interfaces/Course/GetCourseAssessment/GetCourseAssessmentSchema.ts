import z from "zod";

export const GetCourseAssessmentParams = z.object({
  courseId: z.coerce
    .number({ error: "Course ID must be a valid number" })
    .int("Course ID must be a whole number")
    .positive("Course ID must be a positive number"),
});