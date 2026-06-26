import z from "zod/v4";

const positiveIntegerParam = (fieldName: string) =>
  z.coerce
    .number({
      error: `${fieldName} is required`,
    })
    .int(`${fieldName} must be an integer`)
    .positive(`${fieldName} must be a positive integer`);

export const StudentIdParamSchema = z.object({
  studentId: positiveIntegerParam("Student ID"),
});

export const SemesterIdParamSchema = z.object({
  semesterId: positiveIntegerParam("Semester ID"),
});

export const StudentSemesterParamsSchema = z.object({
  studentId: positiveIntegerParam("Student ID"),
  semesterId: positiveIntegerParam("Semester ID"),
});

export const FacultySemesterParamsSchema = z.object({
  semesterId: positiveIntegerParam("Semester ID"),
  facultyId: positiveIntegerParam("Faculty ID"),
});
