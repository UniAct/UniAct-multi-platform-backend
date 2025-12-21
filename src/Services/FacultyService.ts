import { Prisma, PrismaClient } from "../generated/tenants/alexandria_national_university";

const prisma = new PrismaClient();
export class FacultyService{

    static async CreateFaculty(FacultyData: Prisma.FacultyCreateInput){
        const existingFaculty = await prisma.faculty.findUnique({where:{name:FacultyData.name}})
        if(existingFaculty){
            throw new Error (`Faculty with name "${FacultyData.name}" already exists.`);
        }
        
        const newFaculty = await prisma.faculty.create({data:FacultyData});
        console.log(`[INFO] Faculty created successfully: ${FacultyData.name}`)
        return newFaculty;
    }

    static async GetAllFaculties(){
        return await prisma.faculty.findMany();
    }

    static async GetFacultyById(id:number){
        const faculty = await prisma.faculty.findUnique({where:{id}});
        if(!faculty){
            throw new Error (`Faculty with ID: ${id} is not found`);
        }
        return faculty;
    }

    static async DeleteFaculty(id:number){
        prisma.faculty.delete({where:{id}});
    }

}