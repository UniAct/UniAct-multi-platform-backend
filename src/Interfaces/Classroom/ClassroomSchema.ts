import { ClassroomType } from "@prisma/client";
import { z } from "zod/v4";

export const ClassroomIdParamSchema = z.object({
  id: z
    .coerce
    .number({ error: "Classroom ID is required" })
    .int("Classroom ID must be an integer")
    .positive("Classroom ID must be a positive integer"),
});

export const ClassroomUpsertSchema = z.object({
  classroomNumber: z
    .string({ error: "Room number is required" })
    .trim()
    .min(1, "Room number is required")
    .max(50, "Room number must not exceed 50 characters"),
  building: z
    .string({ error: "Building is required" })
    .trim()
    .min(1, "Building is required")
    .max(100, "Building must not exceed 100 characters"),
  capacity: z
    .coerce
    .number({ error: "Capacity is required" })
    .int("Capacity must be an integer")
    .positive("Capacity must be a positive integer"),
  type: z.enum(ClassroomType, {
    error: `Classroom type must be one of: ${Object.values(ClassroomType).join(", ")}`,
  })
});

export type ClassroomIdParam = z.infer<typeof ClassroomIdParamSchema>;
export type ClassroomUpsertDto = z.infer<typeof ClassroomUpsertSchema>;
