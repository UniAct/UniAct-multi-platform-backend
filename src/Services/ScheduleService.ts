import { DayOfWeek, Prisma } from "@prisma/client";
import {ScheduleRepository } from "../Repositories/ScheduleRepository";
import { ConflictError, NotFoundError } from "../Types/Errors";
import {GetScheduleResponse, SaveScheduleInput, ScheduleSlotInput } from "../Interfaces/ScheduleSlot/ScheduleSlotSchema";
import { GetTenantClient } from "../Utils/prismaClient";
import { JobRepository } from "../Repositories/JobRepository";
import { QueueRepository } from "../Repositories/QueueRepository";
import { EnrollmentJobMessage } from "../Interfaces/Enrollment/EnrollmentJobMessage";
import { Queues } from "../Enums/Queues";
import { logger } from "../Utils/Logger";
import { EnrollInScheduleRequestDto } from "../Interfaces/Enrollment/EnrollInScheduleSchema";

export class ScheduleService {
  

  public static async GetSchedule(
  params: { programId: number; academicLevel: number },
  semesterId: number,
  schemaName: string,
): Promise<GetScheduleResponse> {
  const { programId, academicLevel } = params;
  const prisma = GetTenantClient(schemaName);

  // 1. First, get the Program & Faculty ID (needed to scope the staff)
  // We combine this with the Level check to save one round-trip
  //NOTE: accessing prisma not in service layer 
  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: {
      name: true,
      facultyId: true,
      programLevels: {
        where: { level: academicLevel },
        select: { id: true }
      }
    }
  });

  if (!program) throw new NotFoundError(`Program ${programId} not found`);
  const levelId = program.programLevels[0]?.id;
  if (!levelId) throw new NotFoundError(`Level ${academicLevel} is not defined for this program`);

  // 2. Parallel Fetch with Scoping
  // We only fetch staff from the same faculty and courses for this specific level
  const [courses, classrooms, staff, scheduleSlots] = await Promise.all([
    ScheduleRepository.GetCoursesByLevel(levelId, prisma),
    ScheduleRepository.GetAllAvailableClassrooms(prisma),
    ScheduleRepository.GetStaffByFaculty(program.facultyId, prisma),
    ScheduleRepository.GetScheduleSlots(programId, academicLevel, semesterId, prisma)
  ]);

  return {
    meta: {
      programId,
      programName: program.name,
      academicLevel,
      semesterId,
    },
    lookups: {
      courses: courses.map(c => c.course),
      classrooms: classrooms.map(c => ({
        ...c,
        label: `${c.building} / ${c.classroomNumber}`
      })),
      staff: staff.map(s => ({
        id: s.staffId,
        name: `${s.staff.user.firstName} ${s.staff.user.lastName}`,
      })),
    },
    scheduleSlots: scheduleSlots.map(slot => this.mapSlotToResponse(slot))
  };
}


  public static async SaveSchedule(
    payload: SaveScheduleInput,
    semesterId: number,
    tx: Prisma.TransactionClient
  ) {
    const { programId, academicLevel, scheduleSlots } = payload;
    // 1. MUST VALIDATE HERE: Ensure the new state isn't self-conflicting
    this.validateInternalConsistency(scheduleSlots);

    // 2. Fetch current DB state
    const existingSessions = await tx.scheduleSlot.findMany({
      where: { programId, academicLevel, semesterId },
    });
    

    const existingMap = new Map(existingSessions.map((s) => [s.id, s]));
    const incomingNew: ScheduleSlotInput[] = [];
    const incomingExisting: ScheduleSlotInput[] = [];

    scheduleSlots.forEach(s => {
      // If it's a number and exists in DB, it's an update/unchanged
      if (s.id && existingMap.has(s.id)) incomingExisting.push(s);
      else incomingNew.push(s);
    });

    const incomingIds = new Set(incomingExisting.map((s) => s.id));
    const idsToDelete = existingSessions
      .filter((s) => !incomingIds.has(s.id))
      .map((s) => s.id);

    const sessionsToUpdate = incomingExisting.filter((incoming) => {
      const dbRecord = existingMap.get(incoming.id!);
      return this.getFingerprint(incoming) !== this.getFingerprint(dbRecord as any);
    });

    // 3. Execution Phase
    await Promise.all([
      // A. CREATE
      incomingNew.length > 0 && tx.scheduleSlot.createMany({
        data: incomingNew.map((session) => {
          // Extract helper names so they aren't sent to the DB
          // We also extract 'id' to ensure it's not passed as null
          const { id, teacherName, classroomName, ...dbdata } = session;
          
          return {
            ...dbdata,
            programId,
            semesterId,
            academicLevel,
          };
        }),
      }),

      // B. DELETE
      idsToDelete.length > 0 && tx.scheduleSlot.deleteMany({
        where: { id: { in: idsToDelete } },
      }),

      // C. UPDATE
      ...sessionsToUpdate.map(({ id,teacherName,classroomName, ...s }) => // Destructure to use id in where, rest in data
        tx.scheduleSlot.update({
          where: { id },
          data: { ...s,
            programId,     
            academicLevel, 
            semesterId
           },
        })
      ),
    ]);

    // --- 4. NEW: Refresh Phase ---
  // We fetch the entire updated state for this program/level/semester.
  // This ensures all new records have their IDs and all relations are populated.
  const refreshedSlots = await tx.scheduleSlot.findMany({
    where: { 
      programId, 
      academicLevel, 
      semesterId 
    },
    include: {
      course: {select:{id:true, code:true, name:true}},
      teacher: {select:{user:{select:{firstName:true, lastName:true}}}},
      classroom: {select:{id:true, building:true, classroomNumber:true}},
      learningGroup: {select:{id:true, GroupName:true}},
    }
  });

  const mappedSlots = refreshedSlots.map(slot=> this.mapSlotToResponse(slot));

  return {
    deleted: idsToDelete.length,
    created: incomingNew.length,
    updated: sessionsToUpdate.length,
    unchanged: incomingExisting.length - sessionsToUpdate.length,
    scheduleSlots: mappedSlots 
  };
}



  
// Fingerprint ignores the ID and database-specific metadata.
// It only cares about the "Value" of the session.
  private static getFingerprint(s: ScheduleSlotInput): string {
    return `${s.dayOfWeek}-${this.formatTime(s.startTime)}-${this.formatTime(s.endTime)}-${s.courseId}-${s.teacherId}-${s.classroomId}-${s.learningGroupId}-${s.type}`;
  }

  
// Validates that the batch of sessions does not contain internal overlaps.
// This is a "pre-flight" check before hitting the database.
  private static validateInternalConsistency(sessions: ScheduleSlotInput[]): void {
    // 1. Define day order for logical sorting (Optional, but helps with error reporting)
    const dayOrder: Record<DayOfWeek, number> = {
      Saturday: 0, Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5, Friday: 6
    };

    // 2. Sort sessions: First by day, then by startTime.
    // This groups all sessions for the same day together and puts them in chronological order.
    const sorted = [...sessions].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
      }
      return a.startTime.getTime() - b.startTime.getTime();
    });

    // 3. Single-pass overlap check
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      // Only compare sessions occurring on the same day
      if (current.dayOfWeek === next.dayOfWeek && current.endTime > next.startTime) {
        // Overlap occurs if the current session ends after the next one starts

          
          const timeRange = `${this.formatTime(current.startTime)}–${this.formatTime(current.endTime)}`;
          const nextTimeRange = `${this.formatTime(next.startTime)}–${this.formatTime(next.endTime)}`;
          
          if (current.teacherId === next.teacherId) {

            throw new ConflictError(
              `Teacher ${current.teacherName} has overlapping sessions on ${current.dayOfWeek} (${timeRange} and ${nextTimeRange}).`
            );
          }

          if (current.classroomId === next.classroomId) {

            const classroomName = current.classroomName;

            throw new ConflictError(
              `Classroom ${classroomName} is double-booked on ${current.dayOfWeek} (${timeRange} and ${nextTimeRange}).`
            );
          }
      }
    }
  }

  private static mapSlotToResponse(slot: any) {
  return {
    id: slot.id,
    dayOfWeek: slot.dayOfWeek,
    startTime: this.formatTime(slot.startTime),
    endTime: this.formatTime(slot.endTime),
    type: slot.type,
    enrolledSeats:slot.enrolledSeats,
    
    course: {
      id: slot.courseId,
      code: slot.course.code,
      name: slot.course.name
    },
    teacher: {
      id: slot.teacherId,
      name: this.formatFullName(slot.teacher.user.firstName, slot.teacher.user.lastName)
    },
    classroom: {
      id: slot.classroomId,
      label: `${slot.classroom.building} / ${slot.classroom.classroomNumber}`,
      capacity: slot.classroom.capacity
    },
    learningGroup: slot.learningGroup ? {
      id: slot.learningGroup.id,
      name: slot.learningGroup.GroupName,
    } : null,
  };
}
  
   // Utility to format names consistently across the service.

  private static formatFullName(first?: string | null, last?: string | null): string {
    return [first, last].filter(Boolean).join(" ").trim() || "Unknown";
  }

  
   // Formats DB Time objects to HH:mm string format.
  private static formatTime(date: Date): string {
    const h = date.getUTCHours().toString().padStart(2, '0');
    const m = date.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  public static async Enroll(
    schemaName : string,
    studentId : number,
    currentStudentProgramLevelId : number,
    currentSemesterId : number,
    schedule : EnrollInScheduleRequestDto
  ){
    const prisma = GetTenantClient(schemaName);

    const jobId = await JobRepository.CreateEnrollmentJobRecord(studentId , currentSemesterId , prisma);

    const message : EnrollmentJobMessage = {
      jobId,
      schemaName,
      studentId,
      currentStudentProgramLevelId,
      currentSemesterId,
      schedule
    };

    await QueueRepository.Publish<EnrollmentJobMessage>(
      Queues.StudentEnrollment,
      message
    );

    logger.info({
      action: "ScheduleService.Enroll",
      status: "success",
      schema: schemaName,
      jobId,
      studentId,
      currentSemesterId,
      scheduleSlotCount: schedule.scheduleSlots.length,
    });

    return { jobId };
  }
}
