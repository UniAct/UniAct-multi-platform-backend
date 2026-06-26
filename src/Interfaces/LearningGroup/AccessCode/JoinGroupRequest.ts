import { z } from "zod";

export const JoinByAccessCodeSchema = z.object({
  accessCode: z.string().trim().min(4, {
    message: "Access code is too short",
  }).max(50, {
    message: "Access code is too long",
  }),
});

export type JoinByAccessCodeDto = z.infer<typeof JoinByAccessCodeSchema>;