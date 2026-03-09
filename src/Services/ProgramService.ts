import { Prisma, PrismaClient } from "../generated/tenants/anu";
import { NotFoundError } from "../Types/Errors";

const prisma = new PrismaClient
export class programService{


    static async CreateProgram(programData : Prisma.ProgramCreateInput){
        
        const newProgram = await prisma.program.create({data:programData});
        console.log(`[INFO] Program created successfully: ${newProgram.name}`);
        return newProgram;

    }

    static async GetAllPrograms(){
        return await prisma.program.findMany();
    }

    static async GetProgramById(id:number){

        const program = await prisma.program.findUnique({where:{id}});
        if(!program){
            throw new NotFoundError("This program doesn't exist");
        }
    }

    static async DeleteProgramById(id:number){

        const program = await prisma.program.findUnique({ where:{id}});
        if(!program){
            throw new NotFoundError("This program doesn't exist");
        }
        await prisma.program.delete({where:{id}});
        console.log(`[INFO] Program deleted ${program.name}` );

    }
}