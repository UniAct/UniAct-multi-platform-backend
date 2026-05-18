import { CourseAssessmentType } from "@prisma/client";
import { z } from "zod";

export const CreateCourseAssessmentParams = z.object({
  courseId: z.coerce
    .number({ error: "Course ID must be a valid number" })
    .int("Course ID must be a whole number")
    .positive("Course ID must be a positive number"),
});

export const CreateCourseAssessmentBody = z.object({
  label: z
    .string({ error: "Assessment label is required" })
    .min(1, "Assessment label cannot be empty")
    .max(100, "Assessment label cannot exceed 100 characters"),
  assessmentType: z.enum(
    Object.values(CourseAssessmentType) as [string, ...string[]],
    { error: `Assessment type must be one of: ${Object.values(CourseAssessmentType).join(", ")}` }
  ),
  marks: z
    .number({ error: "Marks must be a valid number" })
    .positive("Marks must be greater than 0")
    .max(100, "A single assessment cannot exceed 100 marks")
    .multipleOf(0.01, "Marks can have at most 2 decimal places"),
});

export const DeleteCourseAssessmentParams = z.object({
  assessmentId: z.coerce
    .number({ error: "Assessment ID must be a valid number" })
    .int("Assessment ID must be a whole number")
    .positive("Assessment ID must be a positive number"),
});

export type CreateCourseAssessmentBodyType = z.infer<typeof CreateCourseAssessmentBody>;
