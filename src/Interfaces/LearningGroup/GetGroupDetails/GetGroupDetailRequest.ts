import { z } from "zod";

export const GroupIdParamSchema = z.object({
  groupId: z.coerce.number().int().positive({
    message: "Invalid learning group ID",
  }),
});

export type GroupIdParamDto = z.infer<typeof GroupIdParamSchema>;