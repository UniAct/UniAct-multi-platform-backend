import { DayOfWeek, SlotType } from "@prisma/client";
import { z } from "zod";
import { ClassroomUpsertSchema } from "../Classroom/ClassroomSchema";

// --- 1. BASE SCHEMAS (Internal Building Blocks) ---
// Reuse these everywhere to avoid "re-typing" fields
const BaseCourseSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().min(1),
  name: z.string().min(1),
});

const BaseStaffSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});


export const ScheduleSlotSchema = z.object({
  id: z.coerce.number().int().optional(), // Presence determines Update vs Create
  courseId: z.coerce.number().int().positive(),
  teacherId: z.coerce.number().int().positive(),
  classroomId: z.coerce.number().int().positive(),
  learningGroupId: z.coerce.number().default(1),
  
  // Helpers for Error Reporting (Frontend provides these to save DB queries)
  teacherName: z.string({error:"teacher name is required"}),
  classroomName: z.string({error:"classroom name is required"}),

  dayOfWeek: z.enum(DayOfWeek),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  type: z.enum(SlotType),
})
.refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const SaveScheduleSchema = z.object({
  programId: z.coerce.number().int().positive(),
  academicLevel: z.coerce.number().int().positive(),
  scheduleSlots: z.array(ScheduleSlotSchema),
});

// --- 3. RESPONSE SCHEMAS (For UI/Fetching) ---
// Note the Hierarchical Structure: course, teacher, and classroom are objects
export const ScheduleSlotResponseSchema = z.object({
  id: z.number(),
  dayOfWeek: z.enum(DayOfWeek),
  startTime: z.string(), // ISO time string
  endTime: z.string(),
  type: z.enum(SlotType),
  enrolledSeats:z.number().default(0),
  
  // Hierarchical Data
  course: BaseCourseSchema,
  teacher: BaseStaffSchema,
  classroom: z.object({
    id: z.number(),
    label: z.string(),
    capacity:z.number(),
  }),
  learningGroup: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable(),
});

export const GetScheduleResponseSchema = z.object({
  meta: z.object({
    programId: z.number(),
    programName: z.string(),
    academicLevel: z.number(),
    semesterId: z.number(),
  }),
  lookups: z.object({
    courses: z.array(BaseCourseSchema),
    classrooms: z.array(ClassroomUpsertSchema), 
    staff: z.array(BaseStaffSchema),
  }),
  scheduleSlots: z.array(ScheduleSlotResponseSchema),
});

// --- 4. UTILITY SCHEMAS ---
export const GetScheduleQuerySchema = SaveScheduleSchema.pick({
  programId: true,
  academicLevel: true,
});

export const SaveScheduleResponseSchema = z.object({
  deleted: z.number(),
  created: z.number(),
  updated: z.number(),
  unchanged: z.number(),
  scheduleSlots:z.array(ScheduleSlotResponseSchema),
});

// --- 5. TYPES ---
export type GetScheduleQuery = z.infer<typeof GetScheduleQuerySchema>;
export type ScheduleSlotInput = z.infer<typeof ScheduleSlotSchema>;
export type SaveScheduleInput = z.infer<typeof SaveScheduleSchema>;
export type GetScheduleResponse = z.infer<typeof GetScheduleResponseSchema>;