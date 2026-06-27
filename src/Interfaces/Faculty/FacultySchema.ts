import { z } from "zod";

// --- Regulation Schema (Embedded) ---
export const CreateRegulationSchema = z.object({
  name: z
    .string({ error: "Regulation name is required" })
    .trim()
    .min(1, { message: "Regulation name cannot be empty" })
    .max(255, { message: "Regulation name must be less than 255 characters" }),

  roundToWholeNumber: z.boolean().default(false),
  approximateFractions: z.boolean().default(false),
  
  maxAbsence: z.coerce
    .number()
    .int()
    .nonnegative({ message: "Max absence cannot be negative" })
    .default(0),

  // Coerce handles strings coming from the client payload safely into standard Numbers/Decimals
  minGradeExcellent: z.coerce.number().positive({ message: "Grade threshold must be positive" }),
  minGradeVeryGood: z.coerce.number().positive({ message: "Grade threshold must be positive" }),
  minGradeGood: z.coerce.number().positive({ message: "Grade threshold must be positive" }),
  minGradeAcceptable: z.coerce.number().positive({ message: "Grade threshold must be positive" }),
  minGradeVeryWeak: z.coerce.number().positive({ message: "Grade threshold must be positive" }),
  
  enableMercyRules: z.boolean().default(false),
});



// --- Request Params Schemas ---
export const FacultyIdParamSchema = z.object({
  id: z.coerce
    .number({ error: "Faculty ID is required" })
    .int()
    .positive({ message: "Faculty ID must be a positive integer" }),
});

// --- Request Body Schemas ---
export const CreateFacultyBodySchema = z.object({
  universityId: z.coerce
    .number({ error: "University ID is required" })
    .int()
    .positive({ message: "University ID must be a positive integer" }),

  name: z
    .string({ error: "Faculty name is required" })
    .trim()
    .min(1, { message: "Faculty name is required" })
    .max(255, { message: "Faculty name must be less than 255 characters" }),

  description: z
    .string({ error: "Description must be a string" })
    .optional()
    .nullable(),

  deanId: z.coerce
    .number()
    .int()
    .positive({ message: "Dean ID must be a positive integer" })
    .optional()
    .nullable(),

  // z.coerce.date() automatically parses valid ISO 8601 strings into JS Date objects
  establishedDate: z.coerce
    .date({ error: "Established date must be in a valid ISO 8601 format (YYYY-MM-DD)" })
    .optional()
    .nullable(),

  // Making regulations a strictly required compound block of creation
  regulations: z.array(CreateRegulationSchema).min(1, {message: "At least one academic regulation is required"}),
});

/**
 * Update Faculty Schema
 * .partial() automatically makes all top-level keys optional, 
 * but preserves their internal type-checks (e.g., if 'name' is provided, it must be max 255 chars)
 */
export const UpdateFacultyBodySchema = CreateFacultyBodySchema.partial();

// --- Combined Request Schemas (Optional, depending on your middleware setup) ---
export const UpdateFacultyRequestSchema = z.object({
  params: FacultyIdParamSchema,
  body: UpdateFacultyBodySchema,
});

// --- Inferred TypeScript Types ---
export type FacultyIdParam = z.infer<typeof FacultyIdParamSchema>;
export type CreateFacultyInput = z.infer<typeof CreateFacultyBodySchema>;
export type UpdateFacultyInput = z.infer<typeof UpdateFacultyBodySchema>;