import { DayOfWeek, SlotType } from "@prisma/client";
import { z } from "zod";


// --- Base Entities ---
const CourseInfoSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  credits: z.number()
});

const StaffInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// --- Core Slot Logic ---
export const ScheduleSlotInputSchema = z.object({
  id: z.coerce.number().int().optional(), // The Context ID
  courseId: z.coerce.number().int().positive(),
  teacherId: z.coerce.number().int().positive(),
  classroomId: z.coerce.number().int().positive(),
  learningGroupId: z.coerce.number().nullable().default(null),
  enrolledSeats: z.number().default(0),
  // Helpers for UI validation/errors
  teacherName: z.string().optional(),
  classroomName: z.string().optional(),

  dayOfWeek: z.enum(DayOfWeek),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  type: z.enum(SlotType),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const SaveScheduleSchema = z.object({
  programId: z.coerce.number().int().positive(),
  academicLevel: z.coerce.number().int().positive(),
  scheduleSlots: z.array(ScheduleSlotInputSchema),
});

export const ScheduleSlotResponseSchema = z.object({
  id: z.number(), // Context ID
  slotId: z.number(), // Physical Slot ID
  dayOfWeek: z.enum(DayOfWeek),
  startTime: z.string(), 
  endTime: z.string(),
  type: z.enum(SlotType),
  enrolledSeats: z.number(),
  
  course: CourseInfoSchema,
  teacher: StaffInfoSchema,
  classroom: z.object({
    id: z.number(),
    label: z.string(),
    capacity: z.number(),
  }),
  learningGroup: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable(),
});
export const GetScheduleQuerySchema = SaveScheduleSchema.pick({
  programId: true,
  academicLevel: true,
});

export type GetScheduleQuery = z.infer<typeof GetScheduleQuerySchema>;
export type SlotInput = z.infer<typeof ScheduleSlotInputSchema>;
export type SaveScheduleInput = z.infer<typeof SaveScheduleSchema>;
export type SlotResponse = z.infer<typeof ScheduleSlotResponseSchema>;