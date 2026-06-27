import { RegistrationStatus } from "@prisma/client";
import { z } from "zod/v4";

export const AdminEnrollmentQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(RegistrationStatus).optional(),
  semesterId: z.coerce.number().int().positive().optional(),
  courseId: z.coerce.number().int().positive().optional(),
  studentId: z.coerce.number().int().positive().optional(),
});

export const AdminEnrollmentStudentParamsSchema = z.object({
  studentId: z.coerce.number().int().positive(),
});

export const AdminEnrollmentParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const AdminEnrollmentCreateSchema = z.object({
  studentId: z.number().int().positive(),
  slotContextId: z.number().int().positive(),
  status: z.enum(RegistrationStatus).default(RegistrationStatus.Enrolled),
});

export const AdminEnrollmentUpdateSchema = z.object({
  status: z.enum(RegistrationStatus).optional(),
  slotContextId: z.number().int().positive().optional(),
}).refine((data) => data.status !== undefined || data.slotContextId !== undefined, {
  message: "Provide status or slotContextId to update",
});

export type AdminEnrollmentQuery = z.infer<typeof AdminEnrollmentQuerySchema>;
export type AdminEnrollmentCreateDto = z.infer<typeof AdminEnrollmentCreateSchema>;
export type AdminEnrollmentUpdateDto = z.infer<typeof AdminEnrollmentUpdateSchema>;
