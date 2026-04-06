import { z } from "zod/v4";
import { StudentStatus } from "@prisma/client";


export const StudentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),

  studentId: z.coerce.number().int().min(1).optional(),
  universityStudentId: z.coerce.number().int().min(1).optional(),
  semesterId: z.coerce.number().int().min(1).optional(),

  status:    z.enum(Object.values(StudentStatus) as [StudentStatus, ...StudentStatus[]] , `status must be one of: ${Object.values(StudentStatus).join(", ")}`).optional(),
  programId: z.coerce.number().int().min(1).optional(),

  isVerified: z
  .enum(["true", "false"])
  .transform(v => v === "true")
  .optional(),

  isBlocked: z
  .enum(["true", "false"])
  .transform(v => v === "true")
  .optional(),

  sortOrder: z.enum(["asc", "desc"] , `sortOrder must be one of: asc , desc`).optional(),
});


export type StudentQueryDto = z.infer<typeof StudentQuerySchema>;