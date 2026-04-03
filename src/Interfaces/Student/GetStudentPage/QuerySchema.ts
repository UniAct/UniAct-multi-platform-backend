import { z } from "zod/v4";
import { StudentStatus } from "@prisma/client";


export const StudentQuerySchema = z.object({
  page:  z
  .string()
  .optional()
  .transform(v => v !== undefined ? parseInt(v, 10)  : undefined)
  .pipe(z.number().int().min(1).optional()),
  
  limit: z.string().optional().transform(v => v !== undefined ? parseInt(v, 10)  : undefined).pipe(z.number().int().min(1).max(100).optional()),

  studentId:           z.string().optional().transform(v => v !== undefined ? parseInt(v, 10) : undefined).pipe(z.number().int().min(1).optional()),
  universityStudentId: z.string().optional().transform(v => v !== undefined ? parseInt(v, 10) : undefined).pipe(z.number().int().min(1).optional()),
  nationalId:          z.string().trim().max(50).optional(),

  status:    z.enum(Object.values(StudentStatus) as [StudentStatus, ...StudentStatus[]] , `status must be one of: ${Object.values(StudentStatus).join(", ")}`).optional(),
  programId: z.string().optional().transform(v => v !== undefined ? parseInt(v, 10) : undefined).pipe(z.number().int().min(1).optional()),

  isVerified: z.enum(["true", "false"] , `isVerified must be one of: true , false`).optional().transform(v => v !== undefined ? v === "true" : undefined).pipe(z.boolean().optional()),
  isBlocked:  z.enum(["true", "false"] , `isBlocked must be one of: true , false`).optional().transform(v => v !== undefined ? v === "true" : undefined).pipe(z.boolean().optional()),

  sortOrder: z.enum(["asc", "desc"] , `sortOrder must be one of: asc , desc`).optional(),
});


export type StudentQueryDto = z.infer<typeof StudentQuerySchema>;