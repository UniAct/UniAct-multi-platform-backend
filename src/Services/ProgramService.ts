import { Prisma, PrismaClient,Program } from "../generated/tenants/alexandria_national_university";

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

    static async DeleteProgramById(id:number){

        const program = await prisma.program.findUniqueOrThrow({ where:{id}});
        
        await prisma.program.delete({where:{id}});
        console.log(`[INFO] Program deleted ${program.name}` );

    }

   

}