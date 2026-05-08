import z from "zod";

export const UpdateStudentGradeParam = z.object({
  gradeId: z.coerce
    .number({ error: "Grade ID must be a valid number" })
    .int("Grade ID must be a whole number")
    .positive("Grade ID must be a positive number"),
});

export const UpdateStudentGradeBody = z.object({
  marks: z
    .number({ error: "Marks must be a valid number" })
    .min(0, "Marks cannot be negative")
    .multipleOf(0.01, "Marks can have at most 2 decimal places"),
});

export type UpdateStudentGradeBodyType = z.infer<typeof UpdateStudentGradeBody>;