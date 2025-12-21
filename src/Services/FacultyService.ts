import { Prisma, PrismaClient } from "../generated/tenants/alexandria_national_university";

const prisma = new PrismaClient();
export class FacultyService{

    static async CreateFaculty(FacultyData: Prisma.FacultyCreateInput){
                
        const newFaculty = await prisma.faculty.create({data:FacultyData});
        console.log(`[INFO] Faculty created successfully: ${FacultyData.name}`)
        return newFaculty;
    }

    static async GetAllFaculties(){
        return await prisma.faculty.findMany();
    }

    static async GetFacultyById(id:number){

        const faculty = await prisma.faculty.findUniqueOrThrow({where:{id}});
        return faculty;
    }

    static async DeleteFaculty(id:number){
       await prisma.faculty.delete({where:{id}});
    }

}