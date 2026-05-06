import { z } from "zod";

// 1. Define the shape of the DTO
export const ProgramResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  programType: z.string(),
  faculty: z.object({ name: z.string() }),
  head: z.object({
    user: z.object({ firstName: z.string(), lastName: z.string() })
  }).nullable(),
  facultyCreditHours: z.number(),
  programCreditHours: z.number(),
  universityCreditHours: z.number(),
}).transform((data) => {
  // 2. This logic replaces "MapToProgramResponseDto" function
  return {
    id: data.id,
    headName: data.head 
      ? `${data.head.user.firstName} ${data.head.user.lastName}` 
      : "No head assigned",
    program: {
      name: data.name,
      description: data.description ?? "", // Clean up nulls here
    },
    programType: data.programType,
    facultyName: data.faculty.name,
    contact: data.phone ?? "N/A",
    creditHours: {
      faculty: data.facultyCreditHours,
      program: data.programCreditHours,
      university: data.universityCreditHours
    },
  };
});

// 3. Extract the type from the transformation output
export type ProgramResponseDto = z.infer<typeof ProgramResponseSchema>;