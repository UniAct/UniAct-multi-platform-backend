import z from "zod";
import {ProgramBaseSchema } from "../Create/CreateProgramSchema";
import { applyProgramRefinements } from "../utils";







export const UpdateProgramSchema = applyProgramRefinements(ProgramBaseSchema.partial());

export type UpdateProgramRequestDto = z.infer<typeof UpdateProgramSchema>;

