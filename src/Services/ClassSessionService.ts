import { DayOfWeek, Prisma } from "@prisma/client";
import { ClassSessionRepository } from "../Repositories/ClassSessionRepository";
import { BadRequestError, ConflictError, NotFoundError } from "../Types/Errors";
import { SaveClassSessionLevelBodyDto } from "../Interfaces/ClassSession/ClassSessionSchema";

const DAY_ORDER: DayOfWeek[] = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function normalizeTime(time: string): string {
  if (time.length === 5) return `${time}:00`;
  return time;
}

function toTimeDate(time: string): Date {
  const normalized = normalizeTime(time);
  const [hour, minute, second] = normalized.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, hour, minute, second));
}

function formatTime(dateValue: Date): string {
  const hour = String(dateValue.getUTCHours()).padStart(2, "0");
  const minute = String(dateValue.getUTCMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);
  return aStart < bEnd && aEnd > bStart;
}

function displayTeacherName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export class ClassSessionService {
  public static async GetLevelTimetable(
    params: { programId: number; academicLevel: number },
    semesterId: number,
    schema_name: string,
  ) {
    const { programId, academicLevel } = params;
    const prisma = ClassSessionRepository.GetClient(schema_name);

    const program = await ClassSessionRepository.GetProgramById(programId, prisma);
    if (!program) {
      throw new NotFoundError(`Program ${programId} was not found`);
    }

    const level = await ClassSessionRepository.GetProgramLevel(programId, academicLevel, prisma);
    if (!level) {
      throw new NotFoundError(`Academic level ${academicLevel} was not found for selected program`);
    }

    const [programCourses, classrooms, staff, sessions] = await Promise.all([
      ClassSessionRepository.GetCoursesForProgram(programId, prisma),
      ClassSessionRepository.GetAllAvailableClassrooms(prisma),
      ClassSessionRepository.GetAllStaff(prisma),
      ClassSessionRepository.GetSessionsByLevel(programId, academicLevel, semesterId, prisma),
    ]);

    const courses = programCourses.map((item) => item.course);

    return {
      meta: {
        programId,
        programName: program.name,
        academicLevel,
        semesterId,
      },
      lookups: {
        courses,
        classrooms,
        staff: staff.map((member) => ({
          id: member.userId,
          position: member.position,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          name: displayTeacherName(member.user.firstName, member.user.lastName),
          email: member.user.email,
        })),
      },
      sessions: sessions.map((session) => ({
        id: session.id,
        courseId: session.courseId,
        courseCode: session.course.code,
        courseName: session.course.name,
        teacherId: session.teacherId,
        instructorName: displayTeacherName(session.teacher.user.firstName, session.teacher.user.lastName),
        classroomId: session.classroomId,
        classroomCode: `${session.classroom.building}-${session.classroom.roomNumber}`,
        classroomLabel: `${session.classroom.building} / ${session.classroom.roomNumber}`,
        roomId: session.roomId,
        roomName: session.room.roomName,
        dayOfWeek: session.dayOfWeek,
        startTime: formatTime(session.startTime),
        endTime: formatTime(session.endTime),
      })),
    };
  }

  public static async SaveLevelTimetable(
    payload: SaveClassSessionLevelBodyDto,
    semesterId: number,
    schema_name: string,
  ) {
    return ClassSessionRepository.WithTransaction(schema_name, async (tx) => {
      const { programId, academicLevel, sessions } = payload;

      const [program, level] = await Promise.all([
        ClassSessionRepository.GetProgramById(programId, tx),
        ClassSessionRepository.GetProgramLevel(programId, academicLevel, tx),
      ]);

      if (!program) {
        throw new NotFoundError(`Program ${programId} was not found`);
      }

      if (!level) {
        throw new NotFoundError(`Academic level ${academicLevel} was not found for selected program`);
      }

      const courseIds = Array.from(new Set(sessions.map((item) => item.courseId)));
      const teacherIds = Array.from(new Set(sessions.map((item) => item.teacherId)));
      const classroomIds = Array.from(new Set(sessions.map((item) => item.classroomId)));
      const days = Array.from(new Set(sessions.map((item) => item.dayOfWeek)));

      const [courseRows, teacherRows, classroomRows] = await Promise.all([
        courseIds.length > 0
          ? ClassSessionRepository.GetCoursesByIdsForProgram(programId, courseIds, tx)
          : Promise.resolve([]),
        teacherIds.length > 0
          ? ClassSessionRepository.GetStaffByIds(teacherIds, tx)
          : Promise.resolve([]),
        classroomIds.length > 0
          ? ClassSessionRepository.GetClassroomsByIds(classroomIds, tx)
          : Promise.resolve([]),
      ]);

      const existingCourseIds = new Set(courseRows.map((item) => item.courseId));
      const existingTeacherIds = new Set(teacherRows.map((item) => item.userId));
      const existingClassroomIds = new Set(classroomRows.map((item) => item.id));

      const invalidCourseIds = courseIds.filter((id) => !existingCourseIds.has(id));
      const invalidTeacherIds = teacherIds.filter((id) => !existingTeacherIds.has(id));
      const invalidClassroomIds = classroomIds.filter((id) => !existingClassroomIds.has(id));

      if (invalidCourseIds.length > 0) {
        throw new BadRequestError(`Invalid course IDs for selected program: ${invalidCourseIds.join(", ")}`);
      }

      if (invalidTeacherIds.length > 0) {
        throw new BadRequestError(`Invalid staff IDs: ${invalidTeacherIds.join(", ")}`);
      }

      if (invalidClassroomIds.length > 0) {
        throw new BadRequestError(`Invalid classroom IDs: ${invalidClassroomIds.join(", ")}`);
      }

      const teacherNameById = new Map(
        teacherRows.map((row) => [
          row.userId,
          displayTeacherName(row.user.firstName, row.user.lastName) || `Staff ${row.userId}`,
        ]),
      );

      const classroomLabelById = new Map(
        classroomRows.map((row) => [row.id, `${row.building} / ${row.roomNumber}`]),
      );

      const sessionsWithIndex = sessions.map((item, index) => ({ ...item, __index: index }));

      for (let i = 0; i < sessionsWithIndex.length; i += 1) {
        for (let j = i + 1; j < sessionsWithIndex.length; j += 1) {
          const left = sessionsWithIndex[i];
          const right = sessionsWithIndex[j];

          if (left.dayOfWeek !== right.dayOfWeek) continue;
          if (!overlaps(left.startTime, left.endTime, right.startTime, right.endTime)) continue;

          if (left.teacherId === right.teacherId) {
            throw new ConflictError(
              `${teacherNameById.get(left.teacherId) || `Staff ${left.teacherId}`} is assigned to overlapping slots in draft timetable`,
            );
          }

          if (left.classroomId === right.classroomId) {
            throw new ConflictError(
              `${classroomLabelById.get(left.classroomId) || `Classroom ${left.classroomId}`} is assigned to overlapping slots in draft timetable`,
            );
          }
        }
      }

      const persistedConflicts =
        days.length > 0 && (teacherIds.length > 0 || classroomIds.length > 0)
          ? await ClassSessionRepository.FindConflictingSessions(
            {
              semesterId,
              days,
              teacherIds,
              classroomIds,
              excludeProgramId: programId,
              excludeAcademicLevel: academicLevel,
            },
            tx,
          )
          : [];

      for (const incoming of sessionsWithIndex) {
        const related = persistedConflicts.filter((existing) => {
          if (existing.dayOfWeek !== incoming.dayOfWeek) return false;
          if (existing.teacherId !== incoming.teacherId && existing.classroomId !== incoming.classroomId) return false;

          return overlaps(
            incoming.startTime,
            incoming.endTime,
            formatTime(existing.startTime),
            formatTime(existing.endTime),
          );
        });

        if (!related.length) continue;

        const first = related[0];

        if (first.teacherId === incoming.teacherId) {
          const teacherName = displayTeacherName(first.teacher.user.firstName, first.teacher.user.lastName) || `Staff ${first.teacherId}`;
          throw new ConflictError(
            `${teacherName} is already assigned on ${incoming.dayOfWeek} from ${formatTime(first.startTime)} to ${formatTime(first.endTime)}`,
          );
        }

        const classroomLabel = `${first.classroom.building} / ${first.classroom.roomNumber}`;
        throw new ConflictError(
          `${classroomLabel} is already occupied on ${incoming.dayOfWeek} from ${formatTime(first.startTime)} to ${formatTime(first.endTime)}`,
        );
      }

      await ClassSessionRepository.DeleteSessionsByLevel(programId, academicLevel, semesterId, tx);

      if (sessionsWithIndex.length === 0) {
        return {
          message: "Timetable cleared for selected level",
          meta: { programId, academicLevel, semesterId, savedSessions: 0 },
        };
      }

      const sortedForRoomCreation = [...sessionsWithIndex].sort((left, right) => {
        const dayCmp = DAY_ORDER.indexOf(left.dayOfWeek) - DAY_ORDER.indexOf(right.dayOfWeek);
        if (dayCmp !== 0) return dayCmp;
        return toMinutes(left.startTime) - toMinutes(right.startTime);
      });

      const roomByKey = new Map<string, number>();
      const createRows: Prisma.ClassSessionCreateManyInput[] = [];

      for (const item of sortedForRoomCreation) {
        const roomKey = `${programId}|${academicLevel}|${semesterId}|${item.courseId}|${item.teacherId}`;

        let roomId = roomByKey.get(roomKey);
        if (!roomId) {
          const roomName = `ACA-${program.name}-L${academicLevel}-C${item.courseId}-S${semesterId}`;
          const room = await ClassSessionRepository.GetOrCreateAcademicRoom(roomName, item.teacherId, tx);
          roomId = room.id;
          roomByKey.set(roomKey, roomId);
        }

        createRows.push({
          programId,
          academicLevel,
          semesterId,
          courseId: item.courseId,
          teacherId: item.teacherId,
          classroomId: item.classroomId,
          roomId,
          dayOfWeek: item.dayOfWeek,
          startTime: toTimeDate(item.startTime),
          endTime: toTimeDate(item.endTime),
        });
      }

      await ClassSessionRepository.CreateManySessions(createRows, tx);

      return {
        message: "Timetable saved successfully",
        meta: {
          programId,
          academicLevel,
          semesterId,
          savedSessions: createRows.length,
        },
      };
    }, { timeout: 20000, maxWait: 10000 });
  }
}
