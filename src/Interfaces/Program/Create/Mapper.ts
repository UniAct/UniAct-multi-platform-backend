import { ProgramRepository } from "../../../Repositories/ProgramRepository";
import { CreateProgramResponseDto } from "./CreateProgramResponseDto";

type CreateProgramRow = Awaited<ReturnType<typeof ProgramRepository.CreateProgram>>;
export function MapToProgramResponseDto(raw: CreateProgramRow) : CreateProgramResponseDto {
  return {
    id: raw.programId,
    headName: raw.headName,
    program: {name: raw.programName , description: raw.description!},
    programType: raw.programType,
    facultyName: raw.facultyName,
    contact: raw.contact!,
    creditHours: {
      faculty: raw.facultyCreditHours,
      program: raw.programCreditHours,
      university: raw.universityCreditHours
    },
  }
}