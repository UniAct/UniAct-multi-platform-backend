import { Prisma } from "@prisma/client";
import { CreateProgramRequestDto } from "../Interfaces/Program/Create/CreateProgramSchema";
import { ProgramRepository } from "../Repositories/ProgramRepository";
import { GetTenantClient } from "../Utils/prismaClient";

export class ProgramService {
  static async Create(schemaName: string, program: CreateProgramRequestDto) {
    const connection = GetTenantClient(schemaName);
    return await ProgramRepository.CreateProgram(program, connection);
  }
}


