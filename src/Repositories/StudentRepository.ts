import { Fee, Prisma, PrismaClient, Student, User } from "@prisma/client";
import { CreateStudentRequest } from "../Interfaces/Student";
import { NotFoundError } from "../Types/Errors";
import SystemRoles from "../Enums/SystemRoles";

export class StudentRepository {

  public static async CreateStudent(
    data: CreateStudentRequest,
    password: string,
    prisma: PrismaClient
  ): Promise<Partial<Student>> {

    return await prisma.$transaction(async (tx) => {
      const [fee, role] = await Promise.all([
        tx.fee.findFirst({
          where: {
            programLevelId: data.programLevelId,
            semesterId:     data.semesterId,
          },
        }),
        tx.role.findFirst({
          where:  { name: SystemRoles.Student },
          select: { id: true },
        }),
      ]);

      if (!fee) {
        throw new NotFoundError("No fee Assigned For This Program Level And Semester");
      }

      if (!role) {
        throw new NotFoundError("Student Role Not Found. Please Contact The Administrator.");
      }

      const student = await tx.student.create({
        
        data: {
          fullname: data.fullname,
          universityStudentId: data.universityStudentId,
          status: data.status,
          enrollmentDate: new Date(data.enrollmentDate),
          religion: data.religion,
          gender: data.gender,
          homePhone: data.homePhone ?? null,
          previousQualification: data.previousQualification ?? null,
          secondarySchoolName: data.secondarySchoolName ?? null,
          totalHighSchoolGrades: data.totalHighSchoolGrades ?? null,
          highSchoolSeatNumber: data.highSchoolSeatNumber ?? null,

          program: {
            connect: { id: data.programId }
          },
          programLevel: {
            connect: { id: data.programLevelId }
          },
          user: {
            create: {
              username: data.username,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              password: password,
              isVerified: true,
              dateOfBirth: new Date(data.dateOfBirth),
              address: data.address,
              city: data.city,
              country: data.country,
              nationalId: data.nationalId,
            }
          }
        }
      });

      await Promise.all([
        tx.studentFeeReport.create({
          data: {
            studentId:      student.userId,
            programLevelId: data.programLevelId,
            semesterId:     data.semesterId,
            feeId:          fee.id,
            amount:         fee.amount,
            status:         "Pending",
          },
        }),
        tx.userRole.create({
          data: {
            userId: student.userId,
            roleId: role.id,
          },
        }),
      ]);

      return {
        universityStudentId: student.universityStudentId,
        programId: data.programId,
        programLevelId: data.programLevelId,
        status: student.status,
        enrollmentDate: student.enrollmentDate,
        religion: student.religion,
        gender: student.gender,
      };
    });
  }
  
  public static async StudentExistsByUsername(
    username: string,
    prisma: PrismaClient | Prisma.TransactionClient,
    excludeId?: number
  ): Promise<boolean> {
    const student = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });
    return student !== null && (excludeId ? student.id !== excludeId : true);
  }

  public static async StudentExistsByEmail(
    email: string,
    prisma: PrismaClient | Prisma.TransactionClient,
    excludeId?: number
  ): Promise<boolean> {
    const student = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    return student !== null && (excludeId ? student.id !== excludeId : true);
  }

  public static async StudentExistsByNationalId(
    nationalId: string,
    prisma: PrismaClient | Prisma.TransactionClient,
    excludeId?: number
  ): Promise<boolean> {
    const student = await prisma.user.findUnique({
      where: { nationalId },
      select: { id: true }
    });
    return student !== null && (excludeId ? student.id !== excludeId : true);
  }

  public static async StudentExistsByUniversityId(
    universityStudentId: number,
    prisma: PrismaClient | Prisma.TransactionClient,
    excludeId?: number
  ): Promise<boolean> {
    const student = await prisma.student.findUnique({
      where: { universityStudentId },
      select: { userId: true }
    });
    return student !== null && (excludeId ? student.userId !== excludeId : true);
  }
  
  public static async GetStudentCountByStatus(
    prisma: PrismaClient
  ): Promise<Record<string, number>> {
    const results = await prisma.student.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    return results.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<string, number>);
  }

  public static async GetStudentsByProgramAndLevel(
    programId: number,
    programLevelId: number,
    prisma: PrismaClient
  ): Promise<Student[]> {
    return await prisma.student.findMany({
      where: { programId, programLevelId },
      include: { program: true, programLevel: true }
    });
  }

  public static async Delete(
    studentId: number,
    prisma: PrismaClient
  ): Promise<Student> {
    return await prisma.student.update({
      where: {userId: studentId} , 
      data: {
        user:{
          update: {isBlocked: true}
        }
      },
      include: {user: true}
    });
  }

  public static async CreateStudentWithFee(
    data: CreateStudentRequest,
    password: string,
    fee: Fee,
    roleId : number,
    prisma: PrismaClient
  ): Promise<Partial<Student>> {

    return await prisma.$transaction(async (tx) => {

      const student = await tx.student.create({
        data: {
          fullname:              data.fullname,
          universityStudentId:   data.universityStudentId,
          status:                data.status,
          enrollmentDate:        new Date(data.enrollmentDate),
          religion:              data.religion,
          gender:                data.gender,
          homePhone:             data.homePhone              ?? null,
          previousQualification: data.previousQualification ?? null,
          secondarySchoolName:   data.secondarySchoolName   ?? null,
          totalHighSchoolGrades: data.totalHighSchoolGrades ?? null,
          highSchoolSeatNumber:  data.highSchoolSeatNumber  ?? null,
          program:      { connect: { id: data.programId } },
          programLevel: { connect: { id: data.programLevelId } },
          user: {
            create: {
              username:    data.username,
              firstName:   data.firstName,
              lastName:    data.lastName,
              email:       data.email,
              phone:       data.phone,
              password:    password,
              isVerified:  true,
              dateOfBirth: new Date(data.dateOfBirth),
              address:     data.address,
              city:        data.city,
              country:     data.country,
              nationalId:  data.nationalId,
            },
          },
        },
      });

      await Promise.all([
        tx.studentFeeReport.create({
          data: {
            studentId:      student.userId,
            programLevelId: data.programLevelId,
            semesterId:     data.semesterId,
            feeId:          fee.id,
            amount:         fee.amount,
            status:         "Pending",
          },
        }),
        tx.userRole.create({
          data: {
            userId: student.userId,
            roleId: roleId
          }
        })
      ]);

      return {
        universityStudentId: student.universityStudentId,
        programId:           data.programId,
        programLevelId:      data.programLevelId,
        status:              student.status,
        enrollmentDate:      student.enrollmentDate,
        religion:            student.religion,
        gender:              student.gender,
      };
    });
  }
}