import { CreateProgramRequestDto } from "../Interfaces/Program/Create/CreateProgramSchema";
import { ProgramRepository } from "../Repositories/ProgramRepository";
import { GetTenantClient } from "../Utils/prismaClient";
import { MapToProgramResponseDto } from "../Interfaces/Program/Create/Mapper";

export class ProgramService {
  static async Create(schemaName: string, program: CreateProgramRequestDto) {
    const connection = GetTenantClient(schemaName);
    const result = await ProgramRepository.CreateProgram(program, connection);
    const dto = MapToProgramResponseDto(result);
    return dto;
  }
}


