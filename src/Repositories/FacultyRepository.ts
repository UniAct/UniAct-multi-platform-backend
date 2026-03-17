import { Prisma, PrismaClient } from "@prisma/client";

export class FacultyRepository {

   static async CreateFaculty(FacultyData: Prisma.FacultyCreateInput,prisma:PrismaClient){

      return await prisma.faculty.create({data:FacultyData});
   }

   static async GetAllFaculties(prisma:PrismaClient){
      return await prisma.faculty.findMany();
   }

   static async GetFacultyById(id:number, prisma:PrismaClient){

     return await prisma.faculty.findUnique({ where: { id } });
   }

   static async UpdateFaculty(id:number, FacultyData: Prisma.FacultyUpdateInput, prisma:PrismaClient){
      return prisma.faculty.update({
         where: { id },
         data: FacultyData,
      });
   }

   static async DeleteFaculty(id:number, prisma:PrismaClient) {

      return await prisma.faculty.delete({ where: { id } });
   }

}
