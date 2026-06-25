import { z } from "zod";

export const UpdatePostSchema = z.object({
  content: z.string().trim().max(5000, {
    message: "Content is too long",
  }).optional(),

  dueDate: z.iso.datetime({
    message: "dueDate must be a valid ISO datetime",
  }).optional(),

  removeAttachmentIds: z.string()
    .transform((val) => {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    })
    .pipe(z.array(z.number().int().positive()))
    .optional()
    .default([]),
});

export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;