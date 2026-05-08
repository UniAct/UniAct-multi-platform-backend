import { AttendanceMode } from "@prisma/client";
import { z } from "zod";

export const CreateAttendanceSessionSchema = z.object({
  scheduleSlotId: z.number().int().positive(),
  facultyMemberId: z.number().int().positive(),
  sessionDate: z.string(), // ISO date
  startTime: z.string(),
  endTime: z.string(),
  attendanceMode: z.nativeEnum(AttendanceMode),
  hotspotSsid: z.string().optional(),
  qrCode: z.string().optional(),
  sessionNotes: z.string().optional(),
});

export const UpsertAttendancesSchema = z.object({
  attendanceSessionId: z.number().int().positive(),
  records: z.array(z.object({
    studentId: z.number().int().positive(),
    status: z.enum(["present", "absent", "late"]),
    deviceIp: z.string().optional(),
    deviceMac: z.string().optional(),
    notes: z.string().optional(),
  }))
});

export const ScanAttendanceSchema = z.object({
  qrPayload: z.string().min(1),
  status: z.enum(["present", "late"]).optional().default("present"),
  notes: z.string().optional(),
});

export const StudentAttendanceStatusQuerySchema = z.object({
  semesterId: z.coerce.number().int().positive().optional(),
});

export const GetEnrolledStudentsSchema = z.object({
  slotContextId: z.number().int().positive(),
});

export type CreateAttendanceSessionDto = z.infer<typeof CreateAttendanceSessionSchema>;
export type UpsertAttendancesDto = z.infer<typeof UpsertAttendancesSchema>;
export type GetEnrolledStudentsDto = z.infer<typeof GetEnrolledStudentsSchema>;
export type ScanAttendanceDto = z.infer<typeof ScanAttendanceSchema>;
export type StudentAttendanceStatusQueryDto = z.infer<typeof StudentAttendanceStatusQuerySchema>;
