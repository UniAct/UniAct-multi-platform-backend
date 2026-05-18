import z from "zod";
import { CourseAssessmentType } from "@prisma/client";

export const UpdateCourseAssessmentParams = z.object({
  courseId: z.coerce
    .number({ error: "Course ID must be a valid number" })
    .int("Course ID must be a whole number")
    .positive("Course ID must be a positive number"),
});

export const UpdateCourseAssessmentBody = z.object({
  assessments: z
    .array(
      z.object({
        assessmentId: z.coerce
          .number({ error: "Assessment ID must be a valid number" })
          .int("Assessment ID must be a whole number")
          .positive("Assessment ID must be a positive number"),
        label: z
          .string({ error: "Assessment label is required" })
          .min(1, "Assessment label cannot be empty")
          .max(100, "Assessment label cannot exceed 100 characters"),
        assessmentType: z.enum(
          Object.values(CourseAssessmentType) as [string, ...string[]],
          { error: `Assessment type must be one of: ${Object.values(CourseAssessmentType).join(", ")}` }
        ).optional(),
        marks: z
          .number({ error: "Marks must be a valid number" })
          .positive("Marks must be greater than 0")
          .max(100, "A single assessment cannot exceed 100 marks")
          .multipleOf(0.01, "Marks can have at most 2 decimal places"),
      })
    )
    .min(1, "At least one assessment must be provided")
    .check((ctx) => {
      // guard: no duplicate assessment ids within the same request
      const ids  = ctx.value.map((a) => a.assessmentId);
      const seen = new Set<number>();
      for (const id of ids) {
        if (seen.has(id)) {
          ctx.issues.push({
            code:    "custom",
            input:   ctx.value,
            message: `Duplicate assessment ID found: ${id}`,
          });
          return;
        }
        seen.add(id);
      }
    }),
});

export type UpdateCourseAssessmentBodyType = z.infer<typeof UpdateCourseAssessmentBody>;
