import { DayOfWeek, Prisma } from "@prisma/client";
import {ScheduleRepository } from "../Repositories/ScheduleRepository";
import { ConflictError, NotFoundError } from "../Types/Errors";
import {SlotResponse, SaveScheduleInput, SlotInput } from "../Interfaces/ScheduleSlot/ScheduleSlotSchema";
import { GetTenantClient } from "../Utils/prismaClient";

export class ScheduleService {
  

  public static async GetSchedule(
  params: { programId: number; academicLevel: number },
  semesterId: number,
  schemaName: string,
){
  const { programId, academicLevel } = params;
  const prisma = GetTenantClient(schemaName);

  // 1. First, get the Program & Faculty ID (needed to scope the staff)
  // We combine this with the Level check to save one round-trip
  const program = await ScheduleRepository.GetProgram(programId,academicLevel, prisma);

  if (!program) throw new NotFoundError(`Program ${programId} not found`);
  const levelId = program.programLevels[0]?.id;
  if (!levelId) throw new NotFoundError(`Level ${academicLevel} is not defined for this program`);

  // 2. Parallel Fetch with Scoping
  // We only fetch staff from the same faculty and courses for this specific level
  const [courses, classrooms, staff, slotsContexts] = await Promise.all([
    ScheduleRepository.GetCoursesByLevel(levelId, prisma),
    ScheduleRepository.GetAllAvailableClassrooms(prisma),
    ScheduleRepository.GetStaffByFaculty(program.facultyId, prisma),
    ScheduleRepository.GetScheduleSlotsWithContext(programId, academicLevel, semesterId, prisma)
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
    scheduleSlots: slotsContexts.map(context => this.mapSlotToResponse(context))
  };
}


  public static async SaveSchedule(
  payload: SaveScheduleInput,
  semesterId: number,
  tx: Prisma.TransactionClient
) {
  const { programId, academicLevel, scheduleSlots: incomingSlots } = payload;

  // 1. PRE-FLIGHT VALIDATION (In-memory)
  this.validateInternalConsistency(incomingSlots);

  // 2. FETCH STATE
  const existingContexts = await tx.scheduleSlotContext.findMany({
    where: { programId, academicLevel, semesterId },
    include: { slot: true }
  });

  const existingMap = new Map(existingContexts.map(c => [c.id, c]));
  const incomingIds = new Set(incomingSlots.map(s => s.id).filter(Boolean));

  // 3. HANDLE DELETIONS
  const idsToDelete = existingContexts.filter(c => !incomingIds.has(c.id)).map(c => c.id);
  if (idsToDelete.length > 0) {
    await tx.scheduleSlotContext.deleteMany({ where: { id: { in: idsToDelete } } });
  }

  // 4. SYNC INCOMING SLOTS
  const stats = { created: 0, updated: 0, unchanged: 0 };

  for (const item of incomingSlots) {
    const existingContext = item.id ? existingMap.get(item.id) : null;

    // A. Skip if absolutely no changes
    if (existingContext && this.getFingerprint(item) === this.getFingerprintFromDB(existingContext)) {
      stats.unchanged++;
      continue;
    }

    // B. LOGICAL CONFLICT CHECK (The "Youssef" Scenario)
    // We look for ANY slot occupying this physical footprint
    const conflictingSlot = await tx.scheduleSlot.findUnique({
      where: {
        semesterId_teacherId_classroomId_dayOfWeek_startTime_endTime: {
          teacherId: item.teacherId,
          classroomId: item.classroomId,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          semesterId
        }
      }
    });

    let targetSlotId: number;

    if (conflictingSlot) {
      // Is this a valid "Shared Class"?
      const isSameCourse = conflictingSlot.courseId === item.courseId;
      const isSameType = conflictingSlot.type === item.type;

      if (isSameCourse && isSameType) {
        // VALID: This is a shared class. Use the existing ID.
        targetSlotId = conflictingSlot.id;
      } else {
        // CONFLICT: Same time/place/teacher, but DIFFERENT course/type.
        throw new ConflictError(
          `Teacher ${conflictingSlot.teacherId} `+
          `is already teaching ${conflictingSlot.courseId} (${conflictingSlot.type}) `+
          `in ${conflictingSlot.classroomId} `+
          `from ${this.formatTime(conflictingSlot.startTime)} to ${this.formatTime(conflictingSlot.endTime)}.`
        );
      }
    } else {
      // NEW: No physical footprint exists. Create it.
      const newPhysicalSlot = await tx.scheduleSlot.create({
        data: {
          teacherId: item.teacherId,
          courseId: item.courseId,
          classroomId: item.classroomId,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          semesterId,
          type: item.type,
          enrolledSeats: item.enrolledSeats || 0
        }
      });
      targetSlotId = newPhysicalSlot.id;
    }

    // C. LINK CONTEXT
    if (existingContext) {
      await tx.scheduleSlotContext.update({
        where: { id: item.id },
        data: { slotId: targetSlotId, learningGroupId: item.learningGroupId }
      });
      stats.updated++;
    } else {
      await tx.scheduleSlotContext.create({
        data: {
          slotId: targetSlotId,
          programId,
          academicLevel,
          semesterId,
          learningGroupId: item.learningGroupId
        }
      });
      stats.created++;
    }
  }

  // 5. CLEANUP ORPHANS & REFRESH
  await tx.scheduleSlot.deleteMany({ where: { semesterId, slotContext: { none: {} } } });
  
  const refreshed = await ScheduleRepository.GetScheduleSlotsWithContext(programId, academicLevel, semesterId, tx);
  return {
    metrics: { deleted: idsToDelete.length, ...stats },
    scheduleSlots: refreshed.map(context => this.mapSlotToResponse(context))
  };
}

  // Fingerprint for Incoming Data
  private static getFingerprint(s: SlotInput): string {
   return `${s.courseId}-${s.learningGroupId}-${s.teacherId}-${s.classroomId}-${s.dayOfWeek}-${this.formatTime(s.startTime)}-${this.formatTime(s.endTime)}-${s.type}`;
  }

  // Fingerprint for DB Data
  private static getFingerprintFromDB(c: any): string {
    const s = c.slot;
    return `${s.courseId}-${c.learningGroupId}-${s.teacherId}-${s.classroomId}-${s.dayOfWeek}-${this.formatTime(s.startTime)}-${this.formatTime(s.endTime)}-${s.type}`;
  }
  
  // The Mapper: Flattens the nested (Context + Slot) into the UI Response
private static mapSlotToResponse(context: any): SlotResponse {
    const physical = context.slot; // Corrected: context.slot NOT context.scheduleSlot
    
    return {
      id: context.id,
      slotId: physical.id,
      dayOfWeek: physical.dayOfWeek,
      startTime: this.formatTime(physical.startTime),
      endTime: this.formatTime(physical.endTime),
      type: physical.type,
      enrolledSeats: physical.enrolledSeats,
      
      course:physical.course,

      teacher: {
        id: physical.teacherId,
        name: this.formatFullName(physical.teacher.user.firstName, physical.teacher.user.lastName)
      },
      classroom: {
        id: physical.classroom.id,
        label: `${physical.classroom.building} / ${physical.classroom.classroomNumber}`,
        capacity: physical.classroom.capacity
      },
      learningGroup: context.learningGroup ? {
        id: context.learningGroup.id,
        name: context.learningGroup.groupName // Matching the Prisma model field
      } : null
    };
  }

  // Validates that the batch of sessions does not contain internal overlaps.
// This is a "pre-flight" check before hitting the database.
  private static validateInternalConsistency(sessions: SlotInput[]): void {
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

  
  private static formatFullName(first?: string, last?: string): string {
    return `${first || ''} ${last || ''}`.trim();
  }

  
   // Formats DB Time objects to HH:mm string format.
  private static formatTime(date: Date): string {
    const h = date.getUTCHours().toString().padStart(2, '0');
    const m = date.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
