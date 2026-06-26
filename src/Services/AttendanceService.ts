import { AttendanceRepository } from "../Repositories/AttendanceRepository";
import { GetTenantClient } from "../Utils/prismaClient";
import { Prisma } from "@prisma/client";
import { CreateAttendanceSessionDto, ScanAttendanceDto, UpsertAttendancesDto } from "../Interfaces/Attendance/AttendanceSchema";
import { BadRequestError, ForbiddenError } from "../Types/Errors";
import { TokenPayload } from "../Interfaces/TokenPayload";
import { SemesterRepository } from "../Repositories/SemesterRepository";
import permissions from "../Utils/Permissions.json";
import { CourseAccessService } from "./CourseAccessService";
import { CourseRepository } from "../Repositories/CourseRepository";

export class AttendanceService {
  private static readonly dayOrder: Record<string, number> = {
    Saturday: 0,
    Sunday: 1,
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
    Friday: 6,
  };

  private static resolveCurrentDayOfWeek():
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday" {
    const day = new Date().getDay();
    const map = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ] as const;

    return map[day];
  }

  private static async resolveSemesterId(schemaName: string, user?: TokenPayload) {
    const semesterFromToken = Number(user?.semester?.id);
    if (Number.isInteger(semesterFromToken) && semesterFromToken > 0) {
      return semesterFromToken;
    }

    const prisma = GetTenantClient(schemaName);
    const currentSemester = await SemesterRepository.GetCurrentSemester(prisma, { id: true });
    if (!currentSemester?.id) {
      throw new BadRequestError("No active semester is configured for this university.");
    }

    return currentSemester.id;
  }

  private static tryDecodeQrPayload(payload: string): { studentId: number } {
    try {
      const decoded = JSON.parse(payload) as { studentId?: unknown };
      const studentId = Number(decoded.studentId);

      if (!Number.isInteger(studentId) || studentId <= 0) {
        throw new Error("Invalid student id");
      }

      return { studentId };
    } catch {
      throw new BadRequestError("Invalid QR payload.");
    }
  }

  private static formatTime(value: Date | string | null | undefined) {
    if (!value) {
      return "";
    }

    if (value instanceof Date) {
      return `${value.getUTCHours().toString().padStart(2, "0")}:${value
        .getUTCMinutes()
        .toString()
        .padStart(2, "0")}`;
    }

    const raw = value.toString();
    const match = /(\d{2}:\d{2})/.exec(raw);
    return match?.[1] ?? raw;
  }

  private static getPercent(completed: number, required: number) {
    if (required <= 0) {
      return 0;
    }

    return Math.min(100, Number(((completed / required) * 100).toFixed(2)));
  }

  private static buildProgressSegment(label: string, completed: number, required: number) {
    return {
      label,
      completedCreditHours: Math.min(completed, required),
      requiredCreditHours: required,
      remainingCreditHours: Math.max(required - completed, 0),
      percent: this.getPercent(completed, required),
    };
  }

  private static mapStudentTimetableItem(item: Awaited<ReturnType<typeof AttendanceRepository.GetStudentMobileTimetable>>[number]) {
    const context = item.scheduleSlotContext;
    const slot = context?.slot;
    const teacherUser = slot?.teacher?.user;

    return {
      id: item.id,
      slotId: slot?.id ?? 0,
      slotContextId: context?.id ?? null,
      dayOfWeek: slot?.dayOfWeek ?? "",
      startTime: this.formatTime(slot?.startTime),
      endTime: this.formatTime(slot?.endTime),
      type: slot?.type ?? "",
      registrationStatus: item.status,
      course: slot?.course ?? null,
      classroom: slot?.classroom
        ? {
            ...slot.classroom,
            label: `${slot.classroom.building} / ${slot.classroom.classroomNumber}`,
          }
        : null,
      teacher: teacherUser
        ? {
            name: `${teacherUser.firstName ?? ""} ${teacherUser.lastName ?? ""}`.trim(),
            email: teacherUser.email ?? null,
          }
        : null,
      program: context?.program ?? null,
      academicLevel: context?.academicLevel ?? null,
    };
  }

  private static mapStaffTimetableItem(item: Awaited<ReturnType<typeof AttendanceRepository.GetStaffMobileTimetable>>[number]) {
    return {
      id: item.id,
      slotId: item.id,
      slotContextId: null,
      dayOfWeek: item.dayOfWeek,
      startTime: this.formatTime(item.startTime),
      endTime: this.formatTime(item.endTime),
      type: item.type,
      registrationStatus: null,
      course: item.course,
      classroom: item.classroom
        ? {
            ...item.classroom,
            label: `${item.classroom.building} / ${item.classroom.classroomNumber}`,
          }
        : null,
      teacher: null,
      programContexts: item.slotContext.map((context) => ({
        id: context.id,
        academicLevel: context.academicLevel,
        program: context.program,
        enrolledStudents: context.registrations.length,
      })),
      allowedCapacity: item.allowedCapacity,
      enrolledSeats: item.enrolledSeats,
    };
  }

  private static sortTimetableItems<T extends { dayOfWeek: string; startTime: string }>(items: T[]) {
    return [...items].sort((a, b) => {
      const dayDelta = (this.dayOrder[a.dayOfWeek] ?? 99) - (this.dayOrder[b.dayOfWeek] ?? 99);
      if (dayDelta !== 0) {
        return dayDelta;
      }

      return a.startTime.localeCompare(b.startTime);
    });
  }

  public static async GetCourseOptions(
    semesterId: number,
    schema_name: string,
    user: TokenPayload,
    filters?: {
      teacherId?: number | null;
      programId?: number | null;
      academicLevel?: number | null;
      courseId?: number | null;
    },
  ) {
    const prisma = GetTenantClient(schema_name);
    const resolvedFilters = { ...filters };
    const hasAdminAccess = await CourseAccessService.HasAdminAccess(
      user,
      prisma,
      permissions.program.read.name,
    );

    if (hasAdminAccess) {
      return AttendanceRepository.GetAttendanceCourseOptions(prisma, semesterId, resolvedFilters);
    }

    if (user.isStaff) {
      if (!user.id) {
        throw new ForbiddenError("Access denied.");
      }
      resolvedFilters.teacherId = user.id;
    } else {
      throw new ForbiddenError("Access denied.");
    }

    return AttendanceRepository.GetAttendanceCourseOptions(prisma, semesterId, resolvedFilters);
  }

  public static async GetCourseSummaries(
    semesterId: number,
    schema_name: string,
    user: TokenPayload,
  ) {
    const prisma = GetTenantClient(schema_name);
    const hasAdminAccess = await CourseAccessService.HasAdminAccess(
      user,
      prisma,
      permissions.program.read.name,
    );

    if (hasAdminAccess) {
      return AttendanceRepository.GetAttendanceCourseSummaries(prisma, semesterId);
    }

    if (!user.isStaff || !user.id) {
      throw new ForbiddenError("Access denied.");
    }

    return AttendanceRepository.GetAttendanceCourseSummaries(prisma, semesterId, {
      teacherId: user.id,
    });
  }

  public static async CreateSession(payload: CreateAttendanceSessionDto, schema_name: string, user: TokenPayload) {
    const prisma = GetTenantClient(schema_name);
    await CourseAccessService.EnsureCanAccessScheduleSlot(
      user,
      prisma,
      payload.scheduleSlotId,
      permissions.program.update.name,
    );

    const existingSession = await AttendanceRepository.GetAttendanceSessionBySlotAndDate(
      payload.scheduleSlotId,
      new Date(payload.sessionDate),
      prisma,
    );

    if (existingSession) {
      return existingSession;
    }

    const data: Prisma.AttendanceSessionCreateInput = {
      scheduleSlot: { connect: { id: payload.scheduleSlotId } } as any,
      facultyMember: { connect: { userId: payload.facultyMemberId } } as any,
      sessionDate: new Date(payload.sessionDate),
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
      attendanceMode: payload.attendanceMode as any,
      hotspotSsid: payload.hotspotSsid ?? null,
      qrCode: payload.qrCode ?? null,
      sessionNotes: payload.sessionNotes ?? null,
    };

    return AttendanceRepository.CreateAttendanceSession(data as any, prisma);
  }

  public static async GetSession(id: number, schema_name: string, user: TokenPayload) {
    const prisma = GetTenantClient(schema_name);
    const session = await AttendanceRepository.GetAttendanceSessionById(id, prisma);
    if (!session) {
      throw new BadRequestError("Attendance session not found.");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      session.scheduleSlot.courseId,
      session.scheduleSlot.semesterId,
      permissions.program.read.name,
    );

    return session;
  }

  public static async GetSessionBySlotAndDate(
    scheduleSlotId: number,
    sessionDate: string,
    schema_name: string,
    user: TokenPayload,
  ) {
    const prisma = GetTenantClient(schema_name);
    await CourseAccessService.EnsureCanAccessScheduleSlot(
      user,
      prisma,
      scheduleSlotId,
      permissions.program.read.name,
    );

    return AttendanceRepository.GetAttendanceSessionBySlotAndDate(
      scheduleSlotId,
      new Date(sessionDate),
      prisma,
    );
  }

  public static async GetEnrolledStudents(slotContextId: number, schema_name: string, user: TokenPayload) {
    const prisma = GetTenantClient(schema_name);
    const slotContext = await CourseRepository.GetSlotContextAccessContext(slotContextId, prisma);
    if (!slotContext) {
      throw new BadRequestError("Schedule slot context not found.");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      slotContext.slot.courseId,
      slotContext.semesterId,
      permissions.program.read.name,
    );

    return AttendanceRepository.GetEnrolledStudentsBySlotContext(slotContextId, prisma);
  }

  public static async GetEnrolledStudentsByCourse(
    courseId: number,
    semesterId: number | null,
    schema_name: string,
    user: TokenPayload,
  ) {
    const prisma = GetTenantClient(schema_name);
    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      courseId,
      semesterId,
      permissions.program.read.name,
    );

    return AttendanceRepository.GetEnrolledStudentsByCourse(courseId, semesterId, prisma);
  }

  public static async UpsertAttendances(payload: UpsertAttendancesDto, schema_name: string, user: TokenPayload) {
    const prisma = GetTenantClient(schema_name);
    const session = await AttendanceRepository.GetAttendanceSessionById(payload.attendanceSessionId, prisma);
    if (!session) {
      throw new BadRequestError("Attendance session not found.");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      session.scheduleSlot.courseId,
      session.scheduleSlot.semesterId,
      permissions.program.update.name,
    );

    return AttendanceRepository.UpsertStudentAttendances(payload.attendanceSessionId, payload.records, prisma);
  }

  public static async GetMobileDashboard(user: TokenPayload, schemaName: string) {
    if (!user.id) {
      throw new BadRequestError("Missing user id in token.");
    }

    const prisma = GetTenantClient(schemaName);
    const semesterId = await this.resolveSemesterId(schemaName, user);
    const dayOfWeek = this.resolveCurrentDayOfWeek();

    if (user.isStudent) {
      const [todaySchedule, stats, creditProgress] = await Promise.all([
        AttendanceRepository.GetStudentTodaySchedule(prisma, user.id, semesterId, dayOfWeek),
        AttendanceRepository.GetStudentRegistrationStats(prisma, user.id, semesterId),
        AttendanceRepository.GetStudentCreditProgress(prisma, user.id),
      ]);

      const requiredTotal = creditProgress.requirements.total;
      const completedTotal = creditProgress.completedCreditHours;

      return {
        role: "student",
        semesterId,
        dayOfWeek,
        stats: {
          ...stats,
          completedCourses: creditProgress.completedCourses,
          completedCreditHours: creditProgress.completedCreditHours,
        },
        creditProgress: {
          completedCourses: creditProgress.completedCourses,
          completedCreditHours: completedTotal,
          totalRequiredCreditHours: requiredTotal,
          remainingCreditHours: Math.max(requiredTotal - completedTotal, 0),
          percent: this.getPercent(completedTotal, requiredTotal),
          requirements: creditProgress.requirements,
          program: creditProgress.program,
          faculty: creditProgress.faculty,
          segments: [
            this.buildProgressSegment(
              "University",
              completedTotal,
              creditProgress.requirements.university,
            ),
            this.buildProgressSegment(
              "Faculty",
              Math.max(completedTotal - creditProgress.requirements.university, 0),
              creditProgress.requirements.faculty,
            ),
            this.buildProgressSegment(
              "Program",
              Math.max(
                completedTotal -
                  creditProgress.requirements.university -
                  creditProgress.requirements.faculty,
                0,
              ),
              creditProgress.requirements.program,
            ),
          ],
        },
        todaySchedule,
      };
    }

    if (user.isStaff) {
      const [todaySchedule, stats] = await Promise.all([
        AttendanceRepository.GetStaffTodaySchedule(prisma, user.id, semesterId, dayOfWeek),
        AttendanceRepository.GetStaffTeachingStats(prisma, user.id, semesterId),
      ]);

      return {
        role: "staff",
        semesterId,
        dayOfWeek,
        stats,
        todaySchedule,
      };
    }

    return {
      role: "user",
      semesterId,
      dayOfWeek,
      stats: {},
      todaySchedule: [],
    };
  }

  public static async GetMobileTimetable(user: TokenPayload, schemaName: string) {
    if (!user.id) {
      throw new BadRequestError("Missing user id in token.");
    }

    const prisma = GetTenantClient(schemaName);
    const semesterId = await this.resolveSemesterId(schemaName, user);

    if (user.isStudent) {
      const items = await AttendanceRepository.GetStudentMobileTimetable(prisma, user.id, semesterId);
      const timetable = this.sortTimetableItems(items.map((item) => this.mapStudentTimetableItem(item)));

      return {
        role: "student",
        semesterId,
        timetable,
      };
    }

    if (user.isStaff) {
      const items = await AttendanceRepository.GetStaffMobileTimetable(prisma, user.id, semesterId);
      const timetable = this.sortTimetableItems(items.map((item) => this.mapStaffTimetableItem(item)));

      return {
        role: "staff",
        semesterId,
        timetable,
      };
    }

    throw new ForbiddenError("Student or staff account required.");
  }

  public static async GetStudentAttendanceStatus(user: TokenPayload, schemaName: string, semesterId?: number) {
    if (!user.id || !user.isStudent) {
      throw new ForbiddenError("Student account required.");
    }

    const prisma = GetTenantClient(schemaName);
    const resolvedSemesterId =
      semesterId && Number.isInteger(semesterId) && semesterId > 0
        ? semesterId
        : await this.resolveSemesterId(schemaName, user);

    const timeline = await AttendanceRepository.GetStudentAttendanceStatusTimeline(
      prisma,
      user.id,
      resolvedSemesterId,
    );

    return {
      semesterId: resolvedSemesterId,
      timeline,
      qrPayload: JSON.stringify({
        studentId: user.id,
        universityStudentId: user.student?.universityStudentId ?? null,
        fullName: user.student?.fullname ?? null,
      }),
    };
  }

  public static async ScanAttendanceFromQr(
    attendanceSessionId: number,
    payload: ScanAttendanceDto,
    user: TokenPayload,
    schemaName: string,
  ) {
    if (!user.id) {
      throw new ForbiddenError("Access denied.");
    }

    const prisma = GetTenantClient(schemaName);
    const session = await AttendanceRepository.GetAttendanceSessionById(attendanceSessionId, prisma);

    if (!session) {
      throw new BadRequestError("Attendance session not found.");
    }

    await CourseAccessService.EnsureCanAccessCourse(
      user,
      prisma,
      session.scheduleSlot.courseId,
      session.scheduleSlot.semesterId,
      permissions.program.update.name,
    );

    const { studentId } = this.tryDecodeQrPayload(payload.qrPayload);

    const isEnrolled = await AttendanceRepository.IsStudentEnrolledInSession(
      prisma,
      studentId,
      session.scheduleSlotId,
      session.scheduleSlot.semesterId,
    );

    if (!isEnrolled) {
      throw new ForbiddenError("Scanned student is not enrolled in this class.");
    }

    const attendance = await AttendanceRepository.UpsertSingleStudentAttendance(
      prisma,
      attendanceSessionId,
      studentId,
      payload.status ?? "present",
      payload.notes,
    );

    return {
      attendance,
      studentId,
      status: payload.status ?? "present",
    };
  }
}
