import z from "zod/v4";

export const JobIdParamSchema = z.object({
  id: z
    .string({ error: 'Job ID is required' })
});