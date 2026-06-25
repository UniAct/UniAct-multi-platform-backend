import { z } from "zod";

export const CommentIdParamSchema = z.object({
  groupId: z.coerce.number().int().positive({ message: "Invalid learning group ID" }),
  postId: z.coerce.number().int().positive({ message: "Invalid post ID" }),
  commentId: z.coerce.number().int().positive({ message: "Invalid comment ID" }),
});

export type CommentIdParamDto = z.infer<typeof CommentIdParamSchema>;