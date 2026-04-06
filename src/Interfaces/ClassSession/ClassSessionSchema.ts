import { DayOfWeek } from "@prisma/client";
import { z } from "zod/v4";

const TimeOnlySchema = z
  .string({ error: "Time is required" })
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Time must be in HH:mm or HH:mm:ss format");

export const ClassSessionLevelQuerySchema = z.object({
  programId: z.coerce.number({ error: "Program ID is required" }).int().positive(),
  academicLevel: z.coerce.number({ error: "Academic level is required" }).int().positive(),
});

export const ClassSessionInputSchema = z
  .object({
    courseId: z.coerce.number({ error: "Course ID is required" }).int().positive(),
    teacherId: z.coerce.number({ error: "Teacher ID is required" }).int().positive(),
    classroomId: z.coerce.number({ error: "Classroom ID is required" }).int().positive(),
    dayOfWeek: z.enum(DayOfWeek),
    startTime: TimeOnlySchema,
    endTime: TimeOnlySchema,
  })
  .refine(
    (value) => {
      const toMin = (input: string) => {
        const [h, m] = input.split(":").map(Number);
        return h * 60 + m;
      };

      return toMin(value.endTime) > toMin(value.startTime);
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export const SaveClassSessionLevelBodySchema = z.object({
  programId: z.coerce.number({ error: "Program ID is required" }).int().positive(),
  academicLevel: z.coerce.number({ error: "Academic level is required" }).int().positive(),
  sessions: z.array(ClassSessionInputSchema),
});

export type ClassSessionLevelQuery = z.infer<typeof ClassSessionLevelQuerySchema>;
export type ClassSessionInputDto = z.infer<typeof ClassSessionInputSchema>;
export type SaveClassSessionLevelBodyDto = z.infer<typeof SaveClassSessionLevelBodySchema>;
