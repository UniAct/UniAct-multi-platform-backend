import { Prisma, PrismaClient } from "@prisma/client";

export class ProgramRepository{

   static async CreateProgram(programData:Prisma.ProgramCreateInput,prisma: PrismaClient){
      return await prisma.program.create({data:programData});
   }

   static async GetAllPrograms(prisma:PrismaClient){
      return await prisma.program.findMany();
   }

   static async GetProgramById(id:number, prisma:PrismaClient){
      return prisma.program.findUnique({where:{id}});
   }

   static async DeleteProgramById(id:number, prisma:PrismaClient){
      await prisma.program.delete({where:{id}});
   }
}