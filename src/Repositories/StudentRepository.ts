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

export class StudentRepository {

  public static async CreateStudent(
    data: CreateStudentRequestDto,
    password: string,
    prisma: PrismaClient
  ){
    return await prisma.$transaction(async (tx : Prisma.TransactionClient) => {
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
            semesterId:     data.semesterId,
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
    const {
      page:                _page  = 1,
      limit:               _limit = 20,
      universityStudentId: _universityStudentId,
      nationalId,
      status,
      programId:           _programId,
      semesterId:          _semesterId,
      isVerified:          _isVerified,
      isBlocked:           _isBlocked,
      studentId: _studentId,
      sortOrder
    } = filters;

    const page                = Number(_page);
    const limit               = Number(_limit);
    const universityStudentId = _universityStudentId !== undefined ? Number(_universityStudentId) : undefined;
    const programId           = _programId           !== undefined ? Number(_programId)           : undefined;
    const semesterId          = _semesterId          !== undefined ? Number(_semesterId)          : undefined;
    const isVerified          = _isVerified          !== undefined ? Boolean(_isVerified)         : undefined;
    const isBlocked           = _isBlocked           !== undefined ? Boolean(_isBlocked)          : undefined;
    const studentId           = _studentId           !== undefined ? Number(_studentId)           : undefined;

    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      ...(studentId           !== undefined && { userId: studentId }),
      ...(universityStudentId !== undefined && { universityStudentId }),
      ...(status              && { status }),
      ...(programId           && { programId }),
      ...(semesterId          && { studentFeeReports: { some: { semesterId } } }),

      user: {
        ...(nationalId               && { nationalId }),
        ...(isVerified !== undefined && { isVerified }),
        ...(isBlocked  !== undefined && { isBlocked }),
      },
    };

    const orderBy: Prisma.StudentOrderByWithRelationInput = {
      user: { createdAt: sortOrder },
    };

    const [data, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id:         true,
              username:   true,
              firstName:  true,
              lastName:   true,
              email:      true,
              phone:      true,
              city:       true,
              country:    true,
              nationalId: true,
              isVerified: true,
              isBlocked:  true,
              createdAt:  true,
            },
          },
          program: {
            select: {
              id:          true,
              name:        true,
              programType: true,
            },
          },
          programLevel: {
            select: {
              id:    true,
              level: true,
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      pageNumber: page,
      pageSize:   limit,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      items:      data,
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
          username:    data.username    !== undefined ? data.username              : undefined,
          firstName:   data.firstName   !== undefined ? data.firstName             : undefined,
          lastName:    data.lastName    !== undefined ? data.lastName              : undefined,
          email:       data.email       !== undefined ? data.email                 : undefined,
          phone:       data.phone       !== undefined ? data.phone                 : undefined,
          dateOfBirth: data.dateOfBirth !== undefined ? new Date(data.dateOfBirth) : undefined,
          address:     data.address     !== undefined ? data.address               : undefined,
          city:        data.city        !== undefined ? data.city                  : undefined,
          country:     data.country     !== undefined ? data.country               : undefined,
          nationalId:  data.nationalId  !== undefined ? data.nationalId            : undefined,
        },
      }),

      prisma.student.update({
        where: { userId: studentId },
        data: {
          fullname:              data.fullname              !== undefined ? data.fullname                 : undefined,
          universityStudentId:   data.universityStudentId   !== undefined ? data.universityStudentId      : undefined,
          programId:             data.programId             !== undefined ? data.programId                : undefined,
          programLevelId:        data.programLevelId        !== undefined ? data.programLevelId           : undefined,
          status:                data.status                !== undefined ? data.status                   : undefined,
          enrollmentDate:        data.enrollmentDate        !== undefined ? new Date(data.enrollmentDate) : undefined,
          cgpa:                  data.cgpa                  !== undefined ? data.cgpa                     : undefined,
          religion:              data.religion              !== undefined ? data.religion                 : undefined,
          gender:                data.gender                !== undefined ? data.gender                   : undefined,
          homePhone:             data.homePhone             !== undefined ? data.homePhone                : undefined,
          previousQualification: data.previousQualification !== undefined ? data.previousQualification    : undefined,
          secondarySchoolName:   data.secondarySchoolName   !== undefined ? data.secondarySchoolName      : undefined,
          totalHighSchoolGrades: data.totalHighSchoolGrades !== undefined ? data.totalHighSchoolGrades    : undefined,
          highSchoolSeatNumber:  data.highSchoolSeatNumber  !== undefined ? data.highSchoolSeatNumber     : undefined,
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
  
  // Translates Prisma-specific errors into domain errors (NotFoundError, ConflictError, etc.)
  // Belongs in the repository layer — the service layer should never be aware of Prisma internals.
  public static HandleUpdateError(
    err: any,
    studentId: number,
    data: UpdateStudentRequestDto,
    schemaName: string,
    startTime: number
  ): never {

    if (err instanceof BadRequestError || err instanceof NotFoundError || err instanceof ConflictError) throw err;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {

      if (err.code === PrismaErrorCode.NotFound) {
        const cause = (err.meta?.cause as string) ?? "";

        if (cause.includes("ProgramLevel") || cause.includes("Program Level")) {
          logger.warn({
            action:         "StudentService.Update",
            status:         "failed",
            schema:         schemaName,
            reason:         "program_level_not_found",
            programLevelId: data.programLevelId,
            duration_ms:    Date.now() - startTime,
          });
          throw new NotFoundError(`Program level with ID '${data.programLevelId}' does not exist.`);
        }

        if (cause.includes("Program")) {
          logger.warn({
            action:      "StudentService.Update",
            status:      "failed",
            schema:      schemaName,
            reason:      "program_not_found",
            programId:   data.programId,
            duration_ms: Date.now() - startTime,
          });
          throw new NotFoundError(`Program with ID '${data.programId}' does not exist.`);
        }

        if (cause.includes("Student")) {
          logger.warn({
            action:      "StudentService.Update",
            status:      "failed",
            schema:      schemaName,
            reason:      "student_not_found",
            studentId:   studentId,
            duration_ms: Date.now() - startTime,
          });
          throw new NotFoundError(`Student with ID '${studentId}' does not exist.`);
        }

        logger.warn({
          action:      "StudentService.Update",
          status:      "failed",
          schema:      schemaName,
          reason:      "record_not_found",
          cause:       cause,
          duration_ms: Date.now() - startTime,
        });
        throw new NotFoundError(`A required record was not found.`);
      }

      if (err.code === PrismaErrorCode.UniqueConstraint) {
        const field = (err.meta?.target as string[])?.[0];

        if (field === "username") {
          logger.warn({
            action:      "StudentService.Update",
            status:      "failed",
            schema:      schemaName,
            reason:      "duplicate_username",
            username:    data.username,
            duration_ms: Date.now() - startTime,
          });
          throw new ConflictError(`A student with the username '${data.username}' already exists.`);
        }

        if (field === "email") {
          logger.warn({
            action:      "StudentService.Update",
            status:      "failed",
            schema:      schemaName,
            reason:      "duplicate_email",
            email:       data.email,
            duration_ms: Date.now() - startTime,
          });
          throw new ConflictError(`A student with the email '${data.email}' already exists.`);
        }

        if (field === "national_id") {
          logger.warn({
            action:      "StudentService.Update",
            status:      "failed",
            schema:      schemaName,
            reason:      "duplicate_national_id",
            nationalId:  data.nationalId,
            duration_ms: Date.now() - startTime,
          });
          throw new ConflictError(`The national ID '${data.nationalId}' is already registered.`);
        }

        if (field === "university_student_id") {
          logger.warn({
            action:              "StudentService.Update",
            status:              "failed",
            schema:              schemaName,
            reason:              "duplicate_university_student_id",
            universityStudentId: data.universityStudentId,
            duration_ms:         Date.now() - startTime,
          });
          throw new ConflictError(`The university student ID '${data.universityStudentId}' is already registered.`);
        }
      }

      if (err.code === PrismaErrorCode.ForeignKeyConstraint) {
        const field = (err.meta?.field_name as string) ?? "";

        if (field.includes("program_level_id")) {
          logger.warn({
            action:         "StudentService.Update",
            status:         "failed",
            schema:         schemaName,
            reason:         "invalid_program_level",
            programLevelId: data.programLevelId,
            duration_ms:    Date.now() - startTime,
          });
          throw new NotFoundError(`Program level with ID '${data.programLevelId}' does not exist.`);
        }

        if (field.includes("program_id")) {
          logger.warn({
            action:      "StudentService.Update",
            status:      "failed",
            schema:      schemaName,
            reason:      "invalid_program",
            programId:   data.programId,
            duration_ms: Date.now() - startTime,
          });
          throw new NotFoundError(`Program with ID '${data.programId}' does not exist.`);
        }
      }
    }

    logger.error({
      action:      "StudentService.Update",
      status:      "failed",
      schema:      schemaName,
      err:         err,
      duration_ms: Date.now() - startTime,
    });

    throw new InternalServerError();
  }

  public static HandleCreateError(
    err: any,
    schema: string,
    data: CreateStudentRequestDto,
    duration_ms: number
  ): never {
    
    const baseLog = { action: "StudentRepository.HandleCreateError", schema, duration_ms };
    if (err.code === PrismaErrorCode.UniqueConstraint) {
      const field: string = err.meta?.driverAdapterError?.cause?.constraint?.fields?.[0]; 

      const conflictMap: Record<string, { reason: string; detail: Record<string, unknown>; message: string }> = {
        username: {
          reason: "duplicate_username",
          detail: { username: data.username },
          message: `A student with the username '${data.username}' already exists.`,
        },
        email: {
          reason: "duplicate_email",
          detail: { email: data.email },
          message: `A student with the email '${data.email}' already exists.`,
        },
        national_id: {
          reason: "duplicate_national_id",
          detail: { nationalId: data.nationalId },
          message: `The national ID '${data.nationalId}' is already registered.`,
        },
        university_student_id: {
          reason: "duplicate_university_student_id",
          detail: { universityStudentId: data.universityStudentId },
          message: `The university student ID '${data.universityStudentId}' is already registered.`,
        },
      };
      const conflict = conflictMap[field];
      if (conflict) {
        logger.warn({ ...baseLog, status: "failed", reason: conflict.reason, ...conflict.detail });
        throw new ConflictError(conflict.message);
      }
    }
    
    if (err.code === PrismaErrorCode.ForeignKeyConstraint) {
      logger.warn({
        ...baseLog,
        status: "failed",
        reason: "invalid_program_or_program_level",
        programId: data.programId,
        programLevelId: data.programLevelId,
      });
      throw new NotFoundError(`The Selected program Or Program Level Does Not Exist Or Is Invalid.`);
    }

    logger.error({ ...baseLog, status: "failed", err });
    throw new InternalServerError();
  }

  public static HandleActivateOrDeleteError(
    err: any,
    schema: string,
    studentId: number,
    duration_ms: number,
    action: string
  ) : never {
    if (err.code === PrismaErrorCode.NotFound) {
      logger.warn({
        action,
        status: "failed",
        schema: schema,
        reason: "student_not_found",
        studentId,
        duration_ms: duration_ms,
      });
      throw new NotFoundError(`No student found with id '${studentId}'.`);
    }

    logger.error({
      action,
      status: "error",
      schema: schema,
      studentId,
      error: err.message,
      duration_ms: duration_ms,
    });
      
    throw new InternalServerError();
  }
}