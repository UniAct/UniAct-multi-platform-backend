import { z } from "zod";
import { CourseAssessmentType } from "@prisma/client";

export const AssignCourseAssessmentParams = z.object({
  courseId: z.coerce
    .number({ error: "Course ID must be a valid number" })
    .int("Course ID must be a whole number")
    .positive("Course ID must be a positive number"),
});

export const AssignCourseAssessmentBody = z.object({
  assessments: z
    .array(
      z.object({
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
      })
    )
    .min(1, "At least one assessment must be provided")
    .max(20, "Cannot assign more than 20 assessments at once")
    .check((ctx) => {
      // no duplicate labels within the same request
      const labels = ctx.value.map((a) => a.label.toLowerCase().trim());
      const seen   = new Set<string>();
      for (const label of labels) {
        if (seen.has(label)) {
          ctx.issues.push({
            code:    "custom",
            input:   ctx.value,
            message: `Duplicate assessment label found: "${label}". Each assessment must have a unique label`,
          });
          return;
        }
        seen.add(label);
      }
    })
    .check((ctx) => {
      // total marks across all assessments must equal exactly 100
      const total = ctx.value.reduce((sum, a) => sum + a.marks, 0);
      const rounded = Math.round(total * 100) / 100; 
      if (rounded !== 100) {
        ctx.issues.push({
          code:    "custom",
          input:   ctx.value,
          message: `Total marks across all assessments must equal 100. Current total: ${rounded}`,
        });
      }
    }),
});

export type AssignCourseAssessmentBodyType = z.infer<typeof AssignCourseAssessmentBody>;