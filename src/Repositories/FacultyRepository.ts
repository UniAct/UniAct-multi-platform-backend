import { Prisma, PrismaClient } from "@prisma/client";
import { CreateFacultyInput } from "../Interfaces/Faculty/FacultySchema";

export class FacultyRepository {

   static async CreateFaculty(inputData: CreateFacultyInput, prisma: PrismaClient) {
    const { regulations, ...facultyData } = inputData;

    return await prisma.faculty.create({
      data: {
        ...facultyData,
        regulations: {
          create: regulations, // Prisma creates this inside an atomic database transaction automatically
        },
      },
      include: {
        regulations: true, // Returns the generated regulation along with the new faculty object
      },
    });
  }

   static async GetAllFaculties(prisma:PrismaClient){
      return await prisma.faculty.findMany({select:{id:true, name: true, description:true, deanId:true, regulations:true}});
   }

   static async GetFacultyById(id:number, prisma:PrismaClient){

     return await prisma.faculty.findUnique({ where: { id }, select:{id:true, name:true, deanId: true, programStaffs:true, regulations:true} });
   }

   static async GetProgramsByFacultyId(facultyId: number, prisma: PrismaClient){
      return await prisma.program.findMany({
         where:{facultyId},
         select:{
            id: true,
            name: true,
            facultyId: true,
            programLevels: {
               select: {
                  id: true,
                  level: true,
                  minCredits: true,
                  maxCredits: true,
               },
               orderBy: { level: "asc" },
            },
         },
         orderBy: { name: "asc" },
      })
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
