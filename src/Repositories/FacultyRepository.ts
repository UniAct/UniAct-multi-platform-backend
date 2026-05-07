import { Prisma, PrismaClient } from "@prisma/client";

export class FacultyRepository {

   static async CreateFaculty(FacultyData: Prisma.FacultyCreateInput,prisma:PrismaClient){

      return await prisma.faculty.create({data:FacultyData});
   }

   static async GetAllFaculties(prisma:PrismaClient){
      return await prisma.faculty.findMany({select:{id:true, name: true, description:true, deanId:true}});
   }

   static async GetFacultyById(id:number, prisma:PrismaClient){

     return await prisma.faculty.findUnique({ where: { id }, select:{id:true, name:true, deanId: true} });
   }

   static async GetProgramsByFacultyId(facultyId: number, prisma: PrismaClient){
      return await prisma.program.findMany({where:{facultyId},
          select:{id: true, name: true, programLevels :{select:{level: true,}}}})
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
