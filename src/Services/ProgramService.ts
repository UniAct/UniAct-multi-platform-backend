import { Prisma, PrismaClient,Program } from "../generated/tenants/alexandria_national_university";

const prisma = new PrismaClient
export class programService{


    static async CreateProgram(programData : Prisma.ProgramCreateInput){

        const existingProgram = await prisma.program.findUnique({where:{name:programData.name}})
        if(existingProgram){
            throw new Error(`Program with name ${existingProgram.name} already exists`);
        }
        const newProgram = await prisma.program.create({data:programData});
        console.log(`[INFO] Program created successfully: ${newProgram.name}`);
        return newProgram;

    }

    static async GetAllPrograms(){
        return await prisma.program.findMany();
    }

    static async DeleteProgramById(id:number){

        const program = await prisma.program.findUnique({ where:{id}});
        if(!program){
            throw new Error (`Program with Id ${id} is not found`);
        }
        await prisma.program.delete({where:{id}});
        console.log(`[INFO] Program deleted ${program.name}` );

    }

   

}