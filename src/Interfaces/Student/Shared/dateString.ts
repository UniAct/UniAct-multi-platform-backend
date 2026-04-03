import z from "zod/v4";

export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Must be in YYYY-MM-DD format",
});