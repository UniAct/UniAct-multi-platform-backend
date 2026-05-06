import { DayOfWeek, Prisma } from "@prisma/client";
import { ScheduleRepository } from "../Repositories/ScheduleRepository";
import { ConflictError, NotFoundError } from "../Types/Errors";
import { SlotResponse, SaveScheduleInput, SlotInput } from "../Interfaces/ScheduleSlot/ScheduleSlotSchema";
import { GetTenantClient } from "../Utils/prismaClient";
import { JobRepository } from "../Repositories/JobRepository";
import { QueueRepository } from "../Repositories/QueueRepository";
import { EnrollmentJobMessage } from "../Interfaces/Enrollment/EnrollmentJobMessage";
import { Queues } from "../Enums/Queues";
import { logger } from "../Utils/Logger";
import { EnrollInScheduleRequestDto } from "../Interfaces/Enrollment/EnrollInScheduleSchema";
import { SemesterRepository } from "../Repositories/SemesterRepository";



type SlotsResult = Awaited<ReturnType<typeof ScheduleRepository.GetScheduleSlotsWithContext>>;
type CoursesResult = Awaited<ReturnType<typeof ScheduleRepository.GetCoursesByLevel>>;
type ClassroomsResult = Awaited<ReturnType<typeof ScheduleRepository.GetAllAvailableClassrooms>>;
type StaffResult = Awaited<ReturnType<typeof ScheduleRepository.GetStaffByFaculty>>;


export class ScheduleService {


  public static async GetSchedule(
  params: { programId: number; academicLevel: number; facultyId: number },
  semesterId: number,
  schemaName: string,
  studentId?: number
) {
  const { programId, academicLevel, facultyId } = params;
  const prisma = GetTenantClient(schemaName);
  
  

  // 3. Dynamic Parallel Fetching
  // We always fetch the slots, but lookups are conditional.
  const tasks: Promise<any>[] = [
    ScheduleRepository.GetScheduleSlotsWithContext(programId, academicLevel, semesterId, prisma, studentId)
  ];

  if (typeof(studentId) != "number") {
    tasks.push(
      ScheduleRepository.GetCoursesByLevel(academicLevel, prisma),
      ScheduleRepository.GetAllAvailableClassrooms(prisma),
      ScheduleRepository.GetStaffByFaculty(facultyId, prisma)
    );
  }

  // Execute only the necessary queries
  const [slotsContexts, courses = [], classrooms = [], staff = []] = (await Promise.all(tasks)) as [
    SlotsResult,
    CoursesResult,
    ClassroomsResult,
    StaffResult
  ];

  // 4. Conditional Response Construction
  return {
    meta: {
      programId,
      // programName: program.name,
      academicLevel,
      semesterId,
    },
    // Only populate lookups if the user isn't a student
    lookups: typeof(studentId) === 'number' ? null : {
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
    // i want to delete bthe physical Slot id NOT THE context since there could be shared clase (so in this case i will only delete one context and the other will still be left as stale context )
    const idsToDelete = existingContexts.filter(c => !incomingIds.has(c.id)).map(c => c.slotId);
    if (idsToDelete.length > 0) {
      
      await tx.scheduleSlot.deleteMany({ where: { id: { in: idsToDelete } }  });
    }

    // 4. SYNC INCOMING SLOTS
    const stats = { created: 0, updated: 0, unchanged: 0 };

    for (const incoming of incomingSlots) {
      const existingContext = incoming.id ? existingMap.get(incoming.id) : null;

      // if it was existing then weather it's unchanged or needs to be updated
      if (existingContext) {

        const isUnchanged = this.getFingerprint(incoming) === this.getFingerprintFromDB(existingContext)
        //unchanged case
        if (isUnchanged) {
          stats.unchanged++;
          continue;
        }
        //needs to be updated
        else {
          await tx.scheduleSlot.update({
            where: { id: existingContext.slotId },
            data: {
              type: incoming.type,
              courseId: incoming.courseId,
              teacherId: incoming.teacherId,
              classroomId: incoming.classroomId,
              startTime: incoming.startTime,
              endTime: incoming.endTime,
              dayOfWeek: incoming.dayOfWeek,
            }
          })
          stats.updated++;
          continue;
        }
      } else {

        // B. LOGICAL CONFLICT CHECK 
        // We look for ANY slot occupying this physical footprint
        const existingSlot = await tx.scheduleSlot.findUnique({
          where: {
            semesterId_teacherId_classroomId_dayOfWeek_startTime_endTime: {
              semesterId,
              teacherId: incoming.teacherId,
              classroomId: incoming.classroomId,
              dayOfWeek: incoming.dayOfWeek,
              startTime: incoming.startTime,
              endTime: incoming.endTime
            }
          }
        });


        if (existingSlot) {
          // Is this a valid "Shared Class"?
          const isSameCourse = existingSlot.courseId === incoming.courseId;
          const isSameType = existingSlot.type === incoming.type;

          if (isSameCourse && isSameType) {
            // VALID: This is a shared class. Use the existing ID.

            await tx.scheduleSlotContext.create({
              data: {
                slotId: existingSlot.id,
                programId,
                academicLevel,
                semesterId,
                learningGroupId: incoming.learningGroupId
              }
            });
            stats.created++;
          } else {

            // CONFLICT: Same time/place/teacher, but DIFFERENT course/type.
            throw new ConflictError(
              `Teacher ${incoming.teacherName} ` +
              `is already teaching another Course (${existingSlot.type}) ` +
              `in ${incoming.classroomName} ` +
              `from ${this.formatTime(existingSlot.startTime)} to ${this.formatTime(existingSlot.endTime)}.` +
              `in another program`
            );
          }
        } else {
          // NEW: No physical footprint exists. Create it.
          const newPhysicalSlot = await tx.scheduleSlot.create({
            data: {
              teacherId: incoming.teacherId,
              courseId: incoming.courseId,
              classroomId: incoming.classroomId,
              allowedCapacity:incoming.allowedCpacity,
              dayOfWeek: incoming.dayOfWeek,
              startTime: incoming.startTime,
              endTime: incoming.endTime,
              semesterId,
              type: incoming.type,
              enrolledSeats: incoming.enrolledSeats || 0
            }
          });


          await tx.scheduleSlotContext.create({
            data: {
              slotId: newPhysicalSlot.id,
              programId,
              academicLevel,
              semesterId,
              learningGroupId: incoming.learningGroupId
            }
          });
          stats.created++;
        }
      }
    }

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
      allowedCapacity: physical.allowedCapacity,

      course: physical.course,

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

  public static async Enroll(
    schemaName : string,
    studentId : number,
    cgpa : number,
    currentStudentProgramLevelId : number,
    studentProgramId: number,
    currentSemester: {id : number , term: number},
    schedule : EnrollInScheduleRequestDto
  ){
    const prisma = GetTenantClient(schemaName);

    const jobId = await JobRepository.CreateEnrollmentJobRecord(studentId , currentSemester.id , prisma);

    const message : EnrollmentJobMessage = {
      jobId,
      schemaName,
      studentId,
      cgpa,
      currentStudentProgramLevelId,
      semester: {
        id: currentSemester.id,
        term: currentSemester.term
      },
      studentProgramId,
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
      semesterId: currentSemester.id,
      scheduleSlotCount: schedule.scheduleSlots.length,
    });

    return { jobId };
  }
}
