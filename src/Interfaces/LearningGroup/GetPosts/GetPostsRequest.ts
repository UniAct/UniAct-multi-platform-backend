import { z } from "zod";
import { PostType } from "@prisma/client";

export const GetPostsQuerySchema = z.object({
  postType: z.enum(PostType, {
    message: `Invalid post type. Must be one of: ${Object.values(PostType).join(", ")}`,
  }).optional(),

  pageNumber: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export type GetPostsQueryDto = z.infer<typeof GetPostsQuerySchema>;