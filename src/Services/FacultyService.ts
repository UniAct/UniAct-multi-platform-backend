import { Prisma, PrismaClient } from "../generated/tenants/anu";
import { ConflictError, NotFoundError } from "../Types/Errors";

const prisma = new PrismaClient();
export class FacultyService {

    static async CreateFaculty(FacultyData: Prisma.FacultyCreateInput) {

        const Faculty = await prisma.faculty.findUnique({ where:{name:FacultyData.name} });

        if(Faculty){
            throw new ConflictError("A faculty with the same name already exists");
        }

        const newFaculty = await prisma.faculty.create({data:FacultyData});
        console.log(`[INFO] Faculty created successfully: ${FacultyData.name}`)
        return newFaculty;
    }

    static async GetAllFaculties() {
        return await prisma.faculty.findMany();
    }

    static async GetFacultyById(id: number) {

        const faculty = await prisma.faculty.findUnique({ where: { id } });
        if(!faculty){
            throw new NotFoundError("There is no Faculty with this Id");
        }
        return faculty;
    }

    static async DeleteFaculty(id: number) {
        if(!await prisma.faculty.delete({ where: { id } }))
            throw new NotFoundError("There is no Faculty with this Id");
    }

}