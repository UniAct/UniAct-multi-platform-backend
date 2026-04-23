import { Fee, Prisma, PrismaClient, Student, User } from "@prisma/client";
import { CreateStudentRequest, StudentQuery } from "../Interfaces/Student";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../Types/Errors";
import SystemRoles from "../Enums/SystemRoles";
import { PrismaErrorCode } from "../Enums/PrismaErrorCode";
import { logger } from "../Utils/Logger";
import { UpdateStudentRequestDto } from "../Interfaces/Student/UpdateStudent/UpdateSchema";
import { CreateStudentRequestDto } from "../Interfaces/Student/CreateStudent/CreateSchema";
import { DeleteStudentResponseDto } from "../Interfaces/Student/DeleteStudent/DeleteMapper";
import { StudentQueryDto } from "../Interfaces/Student/GetStudentPage/QuerySchema";
import { IPage } from "../Interfaces/Common/PaginatedList";
import { StudentListItem } from "../Types/StudentList";
import { GetStudentItemResponseDto } from "../Interfaces/Student/GetStudentPage/GetMapper";
import { SemesterRepository } from "./SemesterRepository";

export class StudentRepository {

  public static async CreateStudent(
    data: CreateStudentRequestDto,
    password: string,
    prisma: PrismaClient
  ){
    return await prisma.$transaction(async (tx : Prisma.TransactionClient) => {
      const currentSemester = await SemesterRepository.GetCurrentSemester(prisma , {id: true});
      const [fee, role] = await Promise.all([
        tx.fee.findFirst({
          where: {
            programLevelId:     data.programLevelId,
            semesterNumber:     data.semesterNumber,
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
          enrollmentDate: data.enrollmentDate!,
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
            connect: { id: data.programLevelId },
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
              dateOfBirth: data.dateOfBirth!,
              address: data.address,
              city: data.city,
              country: data.country,
              nationalId: data.nationalId,
            }
          }
        },
        select: {
          fullname:              true,
          universityStudentId:   true,
          programId:             true,
          programLevelId:        true,
          status:                true,
          enrollmentDate:        true,
          cgpa:                  true,
          religion:              true,
          gender:                true,
          homePhone:             true,
          previousQualification: true,
          secondarySchoolName:   true,
          totalHighSchoolGrades: true,
          highSchoolSeatNumber:  true,
          user: {
            select: {
              id: true,
              username:    true,
              firstName:   true,
              lastName:    true,
              email:       true,
              phone:       true,
              dateOfBirth: true,
              address:     true,
              city:        true,
              country:     true,
              nationalId:  true,
            }
          }
        }
      });

      await Promise.all([
        tx.studentFeeReport.create({
          data: {
            studentId:      student.user.id,
            programLevelId: data.programLevelId,
            semesterId:     currentSemester!.id,
            feeId:          fee.id,
            amount:         fee.amount,
            status:         "Pending",
          },
        }),
        tx.userRole.create({
          data: {
            userId: student.user.id,
            roleId: role.id,
          },
        }),
      ]);

      return student;
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
  ) {
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

  public static async Activate(
    studentId: number,
    prisma: PrismaClient
  ) {
    return await prisma.student.update({
      where: {userId: studentId} , 
      data: {
        user:{
          update: {isBlocked: false}
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

public static async GetAll(
  filters: StudentQueryDto,
  prisma: PrismaClient
) {
  // 1. Pagination
  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 20;

  if (typeof page !== "number" || typeof limit !== "number") {
  throw new Error("Pagination params must be numbers");
}

  const skip = (page - 1) * limit;

  // 2. User Filters
  const userFilters: Prisma.UserWhereInput = {
    ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
    ...(filters.isBlocked  !== undefined && { isBlocked: filters.isBlocked }),
  };

  // 3. Main WHERE
  const where: Prisma.StudentWhereInput = {
    ...(filters.studentId           !== undefined && { userId: filters.studentId }),
    ...(filters.universityStudentId !== undefined && { universityStudentId: filters.universityStudentId }),
    ...(filters.status              !== undefined && { status: filters.status }),
    ...(filters.programId           !== undefined && { programId: filters.programId }),
    ...(filters.semesterId          !== undefined && {studentFeeReports: { some: {semesterId: filters.semesterId,},},}),

    ...(Object.keys(userFilters).length > 0 && {
      user: userFilters,
    }),
  };

  // 4. Sorting
  const orderBy: Prisma.StudentOrderByWithRelationInput = {
    user: {
      createdAt: filters.sortOrder ?? "desc",
    },
  };

  // 5. Query (parallel)
  const [items, totalCount] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        userId: true,
        universityStudentId: true,
        status: true,
        enrollmentDate: true,
        cgpa: true,
        gender: true,
        religion: true,
        fullname: true,

        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            city: true,
            country: true,
            nationalId: true,
            isVerified: true,
            isBlocked: true,
            createdAt: true,
          },
        },

        program: {
          select: {
            id: true,
            name: true,
            programType: true,
          },
        },

        programLevel: {
          select: {
            id: true,
            level: true,
          },
        },
      },
    }),

    prisma.student.count({ where }),
  ]);

  // 6. Response
  return {
    pageNumber: page,
    pageSize: limit,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    items,
  };
}

  public static async Update(
    studentId: number,
    data: UpdateStudentRequestDto,
    prisma: PrismaClient
  ) {
    const [_, student] = await prisma.$transaction([
      prisma.user.update({
        where: { id: studentId },
        data: {
          username:    data.username,
          firstName:   data.firstName,
          lastName:    data.lastName,
          email:       data.email,
          phone:       data.phone,
          dateOfBirth: (data.dateOfBirth !== undefined )? new Date(data.dateOfBirth) : undefined,
          address:     data.address,
          city:        data.city,
          country:     data.country,
          nationalId:  data.nationalId,
        },
      }),

      prisma.student.update({
        where: { userId: studentId },
        data: {
          fullname:              data.fullname,
          universityStudentId:   data.universityStudentId,
          programId:             data.programId,
          programLevelId:        data.programLevelId,
          status:                data.status,
          enrollmentDate:        (data.enrollmentDate !== undefined)? new Date(data.enrollmentDate) : undefined,
          cgpa:                  data.cgpa,
          religion:              data.religion,
          gender:                data.gender,
          homePhone:             data.homePhone,
          previousQualification: data.previousQualification,
          secondarySchoolName:   data.secondarySchoolName,
          totalHighSchoolGrades: data.totalHighSchoolGrades,
          highSchoolSeatNumber:  data.highSchoolSeatNumber,
        } satisfies Prisma.StudentUncheckedUpdateInput,

        select: {
          fullname:              true,
          universityStudentId:   true,
          programId:             true,
          programLevelId:        true,
          status:                true,
          enrollmentDate:        true,
          cgpa:                  true,
          religion:              true,
          gender:                true,
          homePhone:             true,
          previousQualification: true,
          secondarySchoolName:   true,
          totalHighSchoolGrades: true,
          highSchoolSeatNumber:  true,
          user: {
            select: {
              username:    true,
              firstName:   true,
              lastName:    true,
              email:       true,
              phone:       true,
              dateOfBirth: true,
              address:     true,
              city:        true,
              country:     true,
              nationalId:  true,
            }
          }
        }
      })
    ]);

    return student;
  }
}