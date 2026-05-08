import { z } from "zod";

export const GetAllStaffCoursesParams = z.object({
  staffId: z.coerce
    .number({
      error: "Staff ID must be a valid number",
    })
    .int("Staff ID must be an integer")
    .positive("Staff ID must be greater than 0"),
});