import z from "zod/v4";

export const JobIdParamSchema = z.object({
  id: z.uuid({
    error: "Job ID must be a valid UUID",
  })
});