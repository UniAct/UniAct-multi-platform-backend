import { z } from "zod/v4";

export const subscribeSchema = z.object({
  slotIds: z
    .array(
      z
        .number({
          error: (issue) =>
            issue.input === undefined
              ? "slotId is required"
              : "slotId must be a number",
        })
        .int("slotId must be an integer")
        .gt(0, "slotId must be greater than 0")
        .lte(Number.MAX_SAFE_INTEGER, "slotId is too large")
    )
    .min(1, "At least one slotId is required")
    .max(200, "Maximum 200 slotIds allowed")
    .refine(
      (arr) => new Set(arr).size === arr.length,
      {
        error: (issue) => {
          const arr = issue.input as number[];
          const seen = new Set<number>();
          const duplicates = new Set<number>();
          for (const id of arr) {
            if (seen.has(id)) duplicates.add(id);
            seen.add(id);
          }
          return `Duplicate slotIds detected: ${[...duplicates].join(", ")}`;
        },
      }
    )
});