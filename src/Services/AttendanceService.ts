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
      const [todaySchedule, stats] = await Promise.all([
        AttendanceRepository.GetStudentTodaySchedule(prisma, user.id, semesterId, dayOfWeek),
        AttendanceRepository.GetStudentRegistrationStats(prisma, user.id, semesterId),
      ]);

      return {
        role: "student",
        semesterId,
        dayOfWeek,
        stats,
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
