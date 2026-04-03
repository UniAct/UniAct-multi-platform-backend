import { z } from 'zod/v4';

export const CreateBulkStudentSchema = z.object({
  programId: z
    .string({error: "programId Is required"}),
  
  programLevelId:  z
    .string({error: "programLevelId Is required"}),

  semesterId:  z
    .string({error: "semesterId Is required"})
});


export type CreateStudentBulkRequestDto = z.infer<typeof CreateBulkStudentSchema>;