import { Prisma, PrismaClient, Program } from "@prisma/client";
import { NotFoundError } from "../Types/Errors";
import { getTenantClient } from "../Utils/prismaClient";
import { ProgramRepository } from "../Repositories/ProgramRepository";
import { logger } from "../Utils/Logger";

export class programService{


    static async CreateProgram(programData : Prisma.ProgramCreateInput, schema_name:string){
        
        const prisma=getTenantClient(schema_name);
        const newProgram = await ProgramRepository.CreateProgram(programData,prisma);

        logger.info(
          {
            action: "programService.CreateProgram",
            program_name : programData.name,
            status: "success"
          }
        );
        return newProgram;

    }

    static async GetAllPrograms(schema_name:string){
        
        const prisma=getTenantClient(schema_name);
        return await ProgramRepository.GetAllPrograms(prisma); 
    }

    static async GetProgramById(id:number, schema_name:string ): Promise<Program>{

        const prisma=getTenantClient(schema_name);
        const program = await ProgramRepository.GetProgramById(id,prisma);

        if(!program){
            throw new NotFoundError("This program doesn't exist");
        }
        return program;
    }

    static async DeleteProgramById(id:number, schema_name:string){

        const prisma=getTenantClient(schema_name);
        await ProgramRepository.DeleteProgramById(id, prisma);
        
    }
}