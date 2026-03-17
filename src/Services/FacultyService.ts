import { Prisma } from "@prisma/client";
import {NotFoundError } from "../Types/Errors";
import { getTenantClient } from "../Utils/prismaClient";
import { FacultyRepository } from "../Repositories/FacultyRepository";


export class FacultyService {

    static async CreateFaculty(FacultyData: Prisma.FacultyCreateInput, schema_name:string) {
        
        const prisma =getTenantClient(schema_name);
        const newFaculty = await FacultyRepository.CreateFaculty(FacultyData,prisma);

        console.log(`[INFO] Faculty created successfully: ${FacultyData.name}`)
        return newFaculty;
    }

    static async GetAllFaculties(schema_name:string) {

        const prisma=getTenantClient(schema_name);
        return FacultyRepository.GetAllFaculties(prisma);
    }

    static async GetFacultyById(id: number, schema_name:string) {

        const prisma=getTenantClient(schema_name);
        const faculty = FacultyRepository.GetFacultyById(id,prisma);

        if(!faculty){
            throw new NotFoundError("There is no Faculty with this Id");
        }
        return faculty;
    }

    static async UpdateFaculty(id: number, FacultyData: Prisma.FacultyUpdateInput, schema_name:string) {

        const prisma =getTenantClient(schema_name);
        return FacultyRepository.UpdateFaculty(id, FacultyData, prisma);
    }

    static async DeleteFaculty(id: number, schema_name:string ) {
        
        const prisma=getTenantClient(schema_name);
        const deletedFaculty = await FacultyRepository.DeleteFaculty(id,prisma);

        if(!deletedFaculty)
            throw new NotFoundError("There is no Faculty with this Id");
    }

}
