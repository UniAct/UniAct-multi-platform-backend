// src/validation/enrollment-window.validation.ts
import { z } from 'zod';

// 1. Define the raw ZodObject structure first
const baseEnrollmentWindowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .optional()
    .nullable(),
  
  facultyId: z
    .number({ message: "Faculty ID is required" })
    .int()
    .positive("Faculty ID must be a valid positive integer"),
  
  programId: z
    .number()
    .int()
    .positive("Program ID must be a valid positive integer")
    .optional()
    .nullable(),
  
  semesterId: z
    .number({ message: "Semester ID is required" })
    .int()
    .positive("Semester ID must be a valid positive integer"),
  
  programLevelId: z
    .number({ message: "Program level Id is required" })
    .int()
    .positive(),
  
  startTime: z.coerce.date({
    message: "Start date and time is required and must be a valid format",
  }),
  
  endTime: z.coerce.date({
    message: "End date and time is required and must be a valid format",
  }),
  
  isActive: z.boolean().default(true),
});

// 2. Build the Creation Schema by applying the refinement to the base object
export const createEnrollmentWindowSchema = baseEnrollmentWindowSchema.refine(
  (data) => data.endTime > data.startTime, 
  {
    message: "The enrollment window end time must be strictly after the start time",
    path: ["endTime"], 
  }
);

// 3. Build the Update Schema by making the base object partial first, THEN adding the conditional refinement
export const updateEnrollmentWindowSchema = baseEnrollmentWindowSchema
  .partial()
  .refine(
    (data) => {
      // For updates, only validate chronology if the admin is updating BOTH dates at the same time
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "The enrollment window end time must be strictly after the start time",
      path: ["endTime"],
    }
  );

// 4. Parameter and Query Schemas for your Router/Controller layers
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid ID parameter"),
});

// TypeScript Inference Types
export type CreateEnrollmentWindowInput = z.infer<typeof createEnrollmentWindowSchema>;
export type UpdateEnrollmentWindowInput = z.infer<typeof updateEnrollmentWindowSchema>;