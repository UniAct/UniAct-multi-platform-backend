import { ProgramRepository } from "../../../Repositories/ProgramRepository";
import { CreateProgramResponseDto } from "./CreateProgramResponseDto";

type CreateProgramRow = Awaited<ReturnType<typeof ProgramRepository.CreateProgram>>;
export function MapToProgramResponseDto(raw: CreateProgramRow) : CreateProgramResponseDto {
  return {
    id: raw.programId,
    name: raw.facultyName,
    description: raw.description!,
    faculty: {name: raw.facultyName},
    contact: {phone: raw.contact!},
    creditHours: {
      faculty: raw.facultyCreditHours,
      program: raw.programCreditHours,
      university: raw.universityCreditHours
    },
    programType: raw.programType,
    head: {fullName: raw.headName}
  }
}