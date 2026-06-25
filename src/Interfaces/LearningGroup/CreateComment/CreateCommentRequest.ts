import { z } from "zod";

export const CreateCommentSchema = z.object({
  content: z.string().trim().min(1, {
    message: "Comment cannot be empty",
  }).max(2000, {
    message: "Comment is too long",
  }),
});

export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;