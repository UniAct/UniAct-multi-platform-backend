import { z } from "zod";
import { PostType } from "@prisma/client";

export const CreatePostSchema = z.object({
  postType: z.enum(PostType, {
    message: `Invalid post type. Must be one of: ${Object.values(PostType).join(", ")}`,
  }),

  content: z.string().trim().max(5000, {
    message: "Content is too long",
  }).optional(),

  dueDate: z.iso.datetime({
    message: "dueDate must be a valid ISO datetime",
  }).optional(),
})
  .refine(
    (data) => data.postType !== PostType.ASSIGNMENT || !!data.dueDate,
    { message: "dueDate is required for ASSIGNMENT posts", path: ["dueDate"] }
  )
  .refine(
    (data) => data.postType === PostType.ASSIGNMENT || !data.dueDate,
    { message: "dueDate is only allowed for ASSIGNMENT posts", path: ["dueDate"] }
  );

export type CreatePostDto = z.infer<typeof CreatePostSchema>;