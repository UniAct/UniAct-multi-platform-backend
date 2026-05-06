import { Program } from "@prisma/client";
import { ProgramResponseSchema } from "../Interfaces/Program/Create/CreateProgramResponseDto";
import { CreateProgramRequestDto } from "../Interfaces/Program/Create/CreateProgramSchema";
import { ProgramRepository } from "../Repositories/ProgramRepository";
import { GetTenantClient } from "../Utils/prismaClient";

export class ProgramService {
  static async Create(program: CreateProgramRequestDto, schemaName: string,) {
    const connection = GetTenantClient(schemaName);
    const result = await ProgramRepository.CreateProgram(program, connection);
  
    return ProgramResponseSchema.parse(result);
  }
  static async GetAllPrograms(schema_name:string){
    const prisma = GetTenantClient(schema_name);
    return await ProgramRepository.GetAllPrograms(prisma);
  }

  static async GetProgramById(id: number, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    return await ProgramRepository.GetProgramById(id, prisma);
  }

  static async GetProgramsByFacultyId(facultyId: number, schema_name: string){
    const prisma = GetTenantClient(schema_name);
    return await ProgramRepository.GetProgramsByFacultyId(facultyId,prisma);
  }

  static async UpdateProgram(id:number, data: any, schema_name: string){
    const prisma = GetTenantClient(schema_name);

    return await ProgramRepository.UpdateProgram(id,data,prisma);
  }
  
}


