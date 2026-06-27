import { Prisma, PrismaClient, RegistrationStatus } from "@prisma/client";
import { Channels } from "../Enums/Channels";
import { LearningGroupService } from "./LearningGroupService";
import { BadRequestError, ConflictError, NotFoundError } from "../Types/Errors";
import { GetTenantClient } from "../Utils/prismaClient";
import { RedisPublisher } from "../Utils/RedisPubSub";
import type {
  AdminEnrollmentCreateDto,
  AdminEnrollmentQuery,
  AdminEnrollmentUpdateDto,
} from "../Interfaces/Enrollment/AdminEnrollmentSchema";

type DbClient = PrismaClient | Prisma.TransactionClient;

type RegistrationWithDetails = Prisma.CourseRegistrationGetPayload<{
  include: typeof registrationInclude;
}>;

type SlotContextWithDetails = Prisma.ScheduleSlotContextGetPayload<{
  include: typeof slotContextInclude;
}>;

const registrationInclude = {
  semester: true,
  student: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, username: true } },
      program: { select: { id: true, name: true } },
      programLevel: { select: { id: true, level: true } },
    },
  },
  scheduleSlotContext: {
    include: {
      program: { select: { id: true, name: true } },
      slot: {
        include: {
          course: {
            include: {
              learningGroups: { select: { id: true, groupName: true, semesterId: true } },
              prerequisites: {
                include: {
                  prerequisite: { select: { id: true, code: true, name: true } },
                },
              },
            },
          },
          teacher: { select: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
          classroom: true,
        },
      },
    },
  },
  grades: {
    include: {
      courseAssessment: { select: { id: true, label: true, maxMarks: true } },
    },
  },
} as const;

const slotContextInclude = {
  program: { select: { id: true, name: true } },
  slot: {
    include: {
      course: {
        include: {
          learningGroups: { select: { id: true, groupName: true, semesterId: true } },
        },
      },
      semester: true,
      teacher: { select: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      classroom: true,
    },
  },
} as const;

export class AdminEnrollmentService {
  static async List(schemaName: string, query: AdminEnrollmentQuery) {
    const prisma = GetTenantClient(schemaName);
    const where = this.buildRegistrationWhere(query);

    const [registrations, summary] = await Promise.all([
      prisma.courseRegistration.findMany({
        where,
        include: registrationInclude,
        orderBy: [
          { enrollmentDate: "desc" },
          { id: "desc" },
        ],
      }),
      this.GetSummary(prisma, query),
    ]);

    return {
      enrollments: registrations.map((registration) => this.mapRegistration(registration)),
      summary,
    };
  }

  static async GetStudentTrack(schemaName: string, studentId: number, query: AdminEnrollmentQuery) {
    const prisma = GetTenantClient(schemaName);
    const student = await prisma.student.findUnique({
      where: { userId: studentId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, username: true } },
        program: { select: { id: true, name: true } },
        programLevel: { select: { id: true, level: true } },
      },
    });

    if (!student) throw new NotFoundError("Student was not found");

    const registrations = await prisma.courseRegistration.findMany({
      where: {
        ...this.buildRegistrationWhere({ ...query, studentId }),
        studentId,
      },
      include: registrationInclude,
      orderBy: [
        { semester: { year: "desc" } },
        { semester: { term: "desc" } },
        { enrollmentDate: "desc" },
      ],
    });

    const availableSlots = await this.GetAvailableSlotsForStudent(prisma, studentId, query.semesterId);

    return {
      student: {
        id: student.userId,
        universityStudentId: student.universityStudentId,
        name: this.fullName(student.user.firstName, student.user.lastName, student.fullname),
        email: student.user.email,
        username: student.user.username,
        cgpa: Number(student.cgpa),
        status: student.status,
        enrollmentDate: this.formatDate(student.enrollmentDate),
        program: { id: student.program.id, name: student.program.name },
        programLevel: { id: student.programLevel.id, level: student.programLevel.level },
      },
      enrollments: registrations.map((registration) => this.mapRegistration(registration)),
      availableSlots: availableSlots.map((slotContext) => this.mapSlotContext(slotContext)),
    };
  }

  static async GetOptions(schemaName: string, query: AdminEnrollmentQuery) {
    const prisma = GetTenantClient(schemaName);
    const [semesters, courses, students, availableSlots] = await Promise.all([
      prisma.semester.findMany({ orderBy: [{ year: "desc" }, { term: "desc" }] }),
      prisma.course.findMany({ select: { id: true, code: true, name: true }, orderBy: { code: "asc" } }),
      prisma.student.findMany({
        take: 50,
        orderBy: { universityStudentId: "asc" },
        include: {
          user: { select: { firstName: true, lastName: true, username: true } },
          program: { select: { id: true, name: true } },
          programLevel: { select: { id: true, level: true } },
        },
      }),
      query.studentId ? this.GetAvailableSlotsForStudent(prisma, query.studentId, query.semesterId) : Promise.resolve([]),
    ]);

    return {
      semesters: semesters.map((semester) => ({
        id: semester.id,
        label: `${semester.year} / Term ${semester.term}`,
        year: semester.year,
        term: semester.term,
        type: semester.type,
      })),
      courses,
      students: students.map((student) => ({
        id: student.userId,
        universityStudentId: student.universityStudentId,
        name: this.fullName(student.user.firstName, student.user.lastName, student.fullname || student.user.username),
        programName: student.program.name,
        academicLevel: student.programLevel.level,
      })),
      availableSlots: availableSlots.map((slotContext) => this.mapSlotContext(slotContext)),
    };
  }

  static async Create(schemaName: string, dto: AdminEnrollmentCreateDto) {
    const prisma = GetTenantClient(schemaName);

    const registration = await prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { userId: dto.studentId },
        include: { programLevel: { select: { level: true } } },
      });
      if (!student) throw new NotFoundError("Student was not found");

      const context = await this.findSlotContext(tx, dto.slotContextId);
      if (context.programId !== student.programId || context.academicLevel !== student.programLevel.level) {
        throw new BadRequestError("Selected slot does not belong to the student's program and academic level");
      }

      await this.ensureNoDuplicateRegistration(tx, dto.studentId, dto.slotContextId, context.slot.semesterId);

      const created = await tx.courseRegistration.create({
        data: {
          studentId: dto.studentId,
          slotContextId: dto.slotContextId,
          semesterId: context.slot.semesterId,
          status: dto.status,
        },
        include: registrationInclude,
      });

      if (dto.status === RegistrationStatus.Enrolled) {
        await this.incrementSeatOrThrow(schemaName, tx, context.slotId);
        await this.syncLearningGroups(tx, dto.studentId, context.slot.semesterId, new Set([this.getLearningGroupId(context)].filter(this.isNumber)), new Set());
      }

      return created;
    });

    await this.publishRemainingSeats(schemaName, registration.scheduleSlotContext?.slotId);
    return this.mapRegistration(registration);
  }

  static async Update(schemaName: string, id: number, dto: AdminEnrollmentUpdateDto) {
    const prisma = GetTenantClient(schemaName);
    const seatUpdates = await prisma.$transaction(async (tx) => {
      const current = await tx.courseRegistration.findUnique({
        where: { id },
        include: registrationInclude,
      });

      if (!current || !current.scheduleSlotContext) throw new NotFoundError("Enrollment was not found");

      const nextContext = dto.slotContextId
        ? await this.findSlotContext(tx, dto.slotContextId)
        : current.scheduleSlotContext;

      if (dto.slotContextId) {
        const student = await tx.student.findUnique({
          where: { userId: current.studentId },
          include: { programLevel: { select: { level: true } } },
        });
        if (!student) throw new NotFoundError("Student was not found");
        if (nextContext.programId !== student.programId || nextContext.academicLevel !== student.programLevel.level) {
          throw new BadRequestError("Selected slot does not belong to the student's program and academic level");
        }
        await this.ensureNoDuplicateRegistration(tx, current.studentId, nextContext.id, nextContext.slot.semesterId, id);
      }

      const nextStatus = dto.status ?? current.status;
      const oldEnrolled = current.status === RegistrationStatus.Enrolled;
      const nextEnrolled = nextStatus === RegistrationStatus.Enrolled;
      const slotChanged = nextContext.id !== current.scheduleSlotContext.id;
      const leaveGroups = new Set<number>();
      const joinGroups = new Set<number>();
      const touchedSlotIds = new Set<number>();

      if (oldEnrolled && (!nextEnrolled || slotChanged)) {
        await tx.scheduleSlot.update({
          where: { id: current.scheduleSlotContext.slotId },
          data: { enrolledSeats: { decrement: 1 } },
        });
        touchedSlotIds.add(current.scheduleSlotContext.slotId);
        const groupId = this.getLearningGroupId(current.scheduleSlotContext);
        if (groupId) leaveGroups.add(groupId);
      }

      if (nextEnrolled && (!oldEnrolled || slotChanged)) {
        await this.incrementSeatOrThrow(schemaName, tx, nextContext.slotId);
        touchedSlotIds.add(nextContext.slotId);
        const groupId = this.getLearningGroupId(nextContext);
        if (groupId) joinGroups.add(groupId);
      }

      const updated = await tx.courseRegistration.update({
        where: { id },
        data: {
          status: nextStatus,
          slotContextId: nextContext.id,
          semesterId: nextContext.slot.semesterId,
        },
        include: registrationInclude,
      });

      if (joinGroups.size > 0) {
        await LearningGroupService.BatchJoinGroups(current.studentId, joinGroups, tx);
      }
      if (leaveGroups.size > 0) {
        await LearningGroupService.BatchLeaveGroups(current.studentId, current.semesterId, leaveGroups, joinGroups, tx);
      }

      return { enrollment: this.mapRegistration(updated), slotIds: [...touchedSlotIds] };
    });

    await Promise.all(seatUpdates.slotIds.map((slotId) => this.publishRemainingSeats(schemaName, slotId)));
    return seatUpdates.enrollment;
  }

  static async Delete(schemaName: string, id: number) {
    const prisma = GetTenantClient(schemaName);
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.courseRegistration.findUnique({
        where: { id },
        include: registrationInclude,
      });

      if (!current || !current.scheduleSlotContext) throw new NotFoundError("Enrollment was not found");

      await tx.courseRegistration.delete({ where: { id } });

      const slotIds = new Set<number>();
      const leaveGroups = new Set<number>();

      if (current.status === RegistrationStatus.Enrolled) {
        await tx.scheduleSlot.update({
          where: { id: current.scheduleSlotContext.slotId },
          data: { enrolledSeats: { decrement: 1 } },
        });
        slotIds.add(current.scheduleSlotContext.slotId);
        const groupId = this.getLearningGroupId(current.scheduleSlotContext);
        if (groupId) leaveGroups.add(groupId);
      }

      await this.syncLearningGroups(tx, current.studentId, current.semesterId, new Set(), leaveGroups);

      return { deleted: this.mapRegistration(current), slotIds: [...slotIds] };
    });

    await Promise.all(result.slotIds.map((slotId) => this.publishRemainingSeats(schemaName, slotId)));
    return result.deleted;
  }

  private static buildRegistrationWhere(query: AdminEnrollmentQuery): Prisma.CourseRegistrationWhereInput {
    const where: Prisma.CourseRegistrationWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.semesterId) where.semesterId = query.semesterId;
    if (query.studentId) where.studentId = query.studentId;
    if (query.courseId) {
      where.scheduleSlotContext = { slot: { courseId: query.courseId } };
    }

    const search = query.search?.trim();
    if (search) {
      const numericSearch = Number(search);
      where.OR = [
        { student: { fullname: { contains: search, mode: "insensitive" } } },
        { student: { user: { firstName: { contains: search, mode: "insensitive" } } } },
        { student: { user: { lastName: { contains: search, mode: "insensitive" } } } },
        { student: { user: { email: { contains: search, mode: "insensitive" } } } },
        { scheduleSlotContext: { slot: { course: { code: { contains: search, mode: "insensitive" } } } } },
        { scheduleSlotContext: { slot: { course: { name: { contains: search, mode: "insensitive" } } } } },
      ];
      if (Number.isInteger(numericSearch)) {
        where.OR.push({ student: { universityStudentId: numericSearch } });
      }
    }

    return where;
  }

  private static async GetSummary(prisma: DbClient, query: AdminEnrollmentQuery) {
    const where = this.buildRegistrationWhere(query);
    const [total, byStatus, activeSeats] = await Promise.all([
      prisma.courseRegistration.count({ where }),
      prisma.courseRegistration.groupBy({
        by: ["status"],
        where,
        _count: { status: true },
      }),
      prisma.courseRegistration.count({ where: { ...where, status: RegistrationStatus.Enrolled } }),
    ]);

    return {
      total,
      activeSeats,
      byStatus: byStatus.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
    };
  }

  private static async GetAvailableSlotsForStudent(prisma: DbClient, studentId: number, semesterId?: number) {
    const student = await prisma.student.findUnique({
      where: { userId: studentId },
      select: { programId: true, programLevel: { select: { level: true } } },
    });
    if (!student) throw new NotFoundError("Student was not found");

    const existing = await prisma.courseRegistration.findMany({
      where: { studentId, ...(semesterId ? { semesterId } : {}) },
      select: { slotContextId: true },
    });

    const existingContextIds = existing
      .map((registration) => registration.slotContextId)
      .filter(this.isNumber);

    return prisma.scheduleSlotContext.findMany({
      where: {
        programId: student.programId,
        academicLevel: student.programLevel.level,
        ...(semesterId ? { semesterId } : {}),
        ...(existingContextIds.length > 0 ? { id: { notIn: existingContextIds } } : {}),
      },
      include: slotContextInclude,
      orderBy: [
        { semesterId: "desc" },
        { slot: { dayOfWeek: "asc" } },
        { slot: { startTime: "asc" } },
      ],
    });
  }

  private static async findSlotContext(tx: Prisma.TransactionClient, id: number) {
    const context = await tx.scheduleSlotContext.findUnique({
      where: { id },
      include: slotContextInclude,
    });

    if (!context) throw new NotFoundError("Schedule slot was not found");
    return context;
  }

  private static async ensureNoDuplicateRegistration(
    tx: Prisma.TransactionClient,
    studentId: number,
    slotContextId: number,
    semesterId: number,
    ignoreRegistrationId?: number
  ) {
    const duplicate = await tx.courseRegistration.findFirst({
      where: {
        studentId,
        slotContextId,
        semesterId,
        ...(ignoreRegistrationId ? { id: { not: ignoreRegistrationId } } : {}),
      },
      select: { id: true },
    });

    if (duplicate) throw new ConflictError("Student is already registered in this schedule slot");
  }

  private static async incrementSeatOrThrow(schemaName: string, tx: Prisma.TransactionClient, slotId: number) {
    const [slot] = await tx.$queryRaw<{ enrolled_seats: number; allowed_capacity: number }[]>`
      SELECT s."enrolled_seats", s."allowedCapacity" AS "allowed_capacity"
      FROM ${Prisma.raw(`"${schemaName}"."ScheduleSlot"`)} AS s
      WHERE s."id" = ${slotId}
      FOR UPDATE OF s
    `;

    if (!slot) throw new NotFoundError("Schedule slot was not found");
    if (slot.enrolled_seats >= slot.allowed_capacity) {
      throw new ConflictError("No available seats in this schedule slot");
    }

    await tx.scheduleSlot.update({
      where: { id: slotId },
      data: { enrolledSeats: { increment: 1 } },
    });
  }

  private static async syncLearningGroups(
    tx: Prisma.TransactionClient,
    studentId: number,
    semesterId: number,
    joinGroups: Set<number>,
    leaveGroups: Set<number>
  ) {
    if (joinGroups.size === 0 && leaveGroups.size === 0) return;
    await LearningGroupService.BatchJoinGroups(studentId, joinGroups, tx);
    await LearningGroupService.BatchLeaveGroups(studentId, semesterId, leaveGroups, joinGroups, tx);
  }

  private static async publishRemainingSeats(schemaName: string, slotId?: number) {
    if (!slotId) return;
    const slot = await GetTenantClient(schemaName).scheduleSlot.findUnique({
      where: { id: slotId },
      select: { allowedCapacity: true, enrolledSeats: true },
    });
    if (!slot) return;

    await RedisPublisher.publish(
      Channels.StudentEnrollment,
      JSON.stringify({ slotId, remainingSeats: slot.allowedCapacity - slot.enrolledSeats })
    );
  }

  private static mapRegistration(registration: RegistrationWithDetails) {
    const context = registration.scheduleSlotContext;
    const slot = context?.slot;
    const course = slot?.course;
    const teacherUser = slot?.teacher.user;

    return {
      id: registration.id,
      studentId: registration.studentId,
      universityStudentId: registration.student.universityStudentId,
      studentName: this.fullName(
        registration.student.user.firstName,
        registration.student.user.lastName,
        registration.student.fullname || registration.student.user.username
      ),
      studentEmail: registration.student.user.email,
      programName: registration.student.program.name,
      academicLevel: registration.student.programLevel.level,
      semesterId: registration.semesterId,
      semesterLabel: `${registration.semester.year} / Term ${registration.semester.term}`,
      enrollmentDate: this.formatDate(registration.enrollmentDate),
      status: registration.status,
      grade: registration.grade,
      gradePoints: registration.gradePoints === null ? null : Number(registration.gradePoints),
      slotContextId: context?.id ?? null,
      scheduleSlotId: slot?.id ?? null,
      course: course
        ? {
          id: course.id,
          code: course.code,
          name: course.name,
          credits: course.credits,
          prerequisites: course.prerequisites.map((item) => item.prerequisite),
          learningGroup: course.learningGroups.find((group) => group.semesterId === registration.semesterId) ?? null,
        }
        : null,
      teacher: teacherUser
        ? {
          id: teacherUser.id,
          name: this.fullName(teacherUser.firstName, teacherUser.lastName),
          email: teacherUser.email,
        }
        : null,
      classroom: slot?.classroom
        ? {
          id: slot.classroom.id,
          label: `${slot.classroom.building} / ${slot.classroom.classroomNumber}`,
          capacity: slot.classroom.capacity,
          type: slot.classroom.type,
        }
        : null,
      schedule: slot
        ? {
          dayOfWeek: slot.dayOfWeek,
          startTime: this.formatTime(slot.startTime),
          endTime: this.formatTime(slot.endTime),
          type: slot.type,
          allowedCapacity: slot.allowedCapacity,
          enrolledSeats: slot.enrolledSeats,
          remainingSeats: slot.allowedCapacity - slot.enrolledSeats,
        }
        : null,
      grades: registration.grades.map((grade) => ({
        id: grade.id,
        marks: Number(grade.marks),
        maxMarks: Number(grade.maxMarks),
        assessmentDate: grade.assessmentDate ? this.formatDate(grade.assessmentDate) : null,
        label: grade.courseAssessment.label,
        assessmentMaxMarks: Number(grade.courseAssessment.maxMarks),
        comments: grade.comments,
      })),
    };
  }

  private static mapSlotContext(context: SlotContextWithDetails) {
    const teacherUser = context.slot.teacher.user;
    return {
      slotContextId: context.id,
      scheduleSlotId: context.slotId,
      semesterId: context.semesterId,
      semesterLabel: `${context.slot.semester.year} / Term ${context.slot.semester.term}`,
      programId: context.programId,
      programName: context.program.name,
      academicLevel: context.academicLevel,
      course: {
        id: context.slot.course.id,
        code: context.slot.course.code,
        name: context.slot.course.name,
        credits: context.slot.course.credits,
        learningGroup: context.slot.course.learningGroups.find((group) => group.semesterId === context.semesterId) ?? null,
      },
      teacher: {
        id: teacherUser.id,
        name: this.fullName(teacherUser.firstName, teacherUser.lastName),
        email: teacherUser.email,
      },
      classroom: {
        id: context.slot.classroom.id,
        label: `${context.slot.classroom.building} / ${context.slot.classroom.classroomNumber}`,
        capacity: context.slot.classroom.capacity,
        type: context.slot.classroom.type,
      },
      schedule: {
        dayOfWeek: context.slot.dayOfWeek,
        startTime: this.formatTime(context.slot.startTime),
        endTime: this.formatTime(context.slot.endTime),
        type: context.slot.type,
        allowedCapacity: context.slot.allowedCapacity,
        enrolledSeats: context.slot.enrolledSeats,
        remainingSeats: context.slot.allowedCapacity - context.slot.enrolledSeats,
      },
    };
  }

  private static getLearningGroupId(context: {
    semesterId: number;
    slot: { course: { learningGroups: Array<{ id: number; semesterId: number }> } };
  }): number | null {
    return context.slot.course.learningGroups.find((group) => group.semesterId === context.semesterId)?.id ?? null;
  }

  private static fullName(first?: string | null, last?: string | null, fallback?: string | null) {
    return [first, last].filter(Boolean).join(" ").trim() || fallback || "Unknown Student";
  }

  private static formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private static formatTime(date: Date) {
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  private static isNumber(value: number | null | undefined): value is number {
    return typeof value === "number";
  }
}
