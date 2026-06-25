import { z } from "zod";

export const PostIdParamSchema = z.object({
  groupId: z.coerce.number().int().positive({ message: "Invalid learning group ID" }),
  postId: z.coerce.number().int().positive({ message: "Invalid post ID" }),
});

export type PostIdParamDto = z.infer<typeof PostIdParamSchema>;