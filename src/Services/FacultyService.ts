import { Prisma } from "@prisma/client";
import {NotFoundError } from "../Types/Errors";
import { GetTenantClient } from "../Utils/prismaClient";
import { FacultyRepository } from "../Repositories/FacultyRepository";
import { logger } from "../Utils/Logger";
import { levels } from "pino";
import { CreateFacultyInput } from "../Interfaces/Faculty/FacultySchema";


export class FacultyService {

    static async CreateFaculty(FacultyData: CreateFacultyInput, schema_name:string) {
        
        const prisma =GetTenantClient(schema_name);
        const newFaculty = await FacultyRepository.CreateFaculty(FacultyData,prisma);

        logger.info(
          {
            action: "FacultyService.CreateFaculty",
            faculty_name: newFaculty.name,
            status: "success"
          }
        );
        return newFaculty;
    }

    static async GetAllFaculties(schema_name:string) {

        const prisma=GetTenantClient(schema_name);
        return FacultyRepository.GetAllFaculties(prisma);
    }

    static async GetFacultyById(id: number, schema_name:string) {

        const prisma=GetTenantClient(schema_name);
        const faculty = FacultyRepository.GetFacultyById(id,prisma);

        if(!faculty){
            throw new NotFoundError("There is no Faculty with this Id");
        }
        return faculty;
    }

    static async GetProgramsByFacultyId(facultyId: number, schema_name: string){
        const prisma = GetTenantClient(schema_name);
        const programs = await FacultyRepository.GetProgramsByFacultyId(facultyId,prisma);
        return programs.map(p=>({id:p.id, name: p.name, levels: p.programLevels}))
    }

    static async UpdateFaculty(id: number, FacultyData: Prisma.FacultyUpdateInput, schema_name:string) {

        const prisma =GetTenantClient(schema_name);
        return FacultyRepository.UpdateFaculty(id, FacultyData, prisma);
    }

    static async DeleteFaculty(id: number, schema_name:string ) {
        
        const prisma=GetTenantClient(schema_name);
        const deletedFaculty = await FacultyRepository.DeleteFaculty(id,prisma);

        if(!deletedFaculty)
            throw new NotFoundError("There is no Faculty with this Id");
    }

}
