import { Job } from "bullmq";
import { Queues } from "../../Enums/Queues";
import { GetWorkerSingleton } from "../../Utils/BullMQConfig";
import { logger } from "../../Utils/Logger";
import { EnrollmentJobMessage } from "../../Interfaces/Enrollment/EnrollmentJobMessage";
import { GetTenantClient } from "../../Utils/prismaClient";
import { EnrollmentJobStatus, Prisma } from "@prisma/client";
import { RedisPublisher } from "../../Utils/RedisPubSub";
import { Channels } from "../../Enums/Channels";
import { ScheduleRepository } from "../../Repositories/ScheduleRepository";

/**
 * Enrollment Worker
 * ----------------------------------------------------------------------------
 * Processes student enrollment requests asynchronously using BullMQ.
 *
 * Responsibilities:
 * - Validates submitted schedule slots against the database (never trust client input)
 * - Enforces academic rules (credit limits per semester & program level)
 * - Prevents duplicate registrations for the same slot
 * - Ensures seat availability and prevents overbooking
 * - Performs enrollment operations atomically to handle concurrency safely
 * - Publishes real-time seat updates via Redis pub/sub for downstream consumers (e.g., WebSocket layer)
 * - Tracks per-slot outcomes and persists final job results
 *
 * Workflow:
 * 1. Mark job as "Processing"
 * 2. Fetch slot contexts + academic load + already-enrolled in parallel
 * 3. Ensure all requested slots exist and belong to the student's program
 * 4. Calculate total credits (deduplicated per course)
 * 5. Validate against academic load constraints (min/max credits)
 * 6. Process each slot:
 *    - Skip if already enrolled
 *    - Fast stale seat check (early exit)
 *    - Execute enrollment + seat increment in a transaction (real guard)
 *    - Publish seat updates for real-time systems
 * 7. Mark job as "Done" with detailed results
 *
 * Concurrency & Consistency:
 * - Uses database transactions to prevent race conditions during seat allocation
 * - Re-checks seat availability inside the transaction for correctness under concurrent requests
 * - enrolledSeats lives on the physical ScheduleSlot — shared across all programs in the same room
 *
 * Failure Handling:
 * - Gracefully handles partial failures (per-slot outcomes)
 * - Captures unexpected errors and marks job as completed with error details
 *
 * Input:
 * - EnrollmentJobMessage (student, semester, schedule slots, etc.)
 *
 * Output:
 * - Updates enrollmentJob record with final status and per-slot results
 */

interface SlotOutcome {
  slotId: number;
  courseCode: string;
  courseName: string;
  status: "enrolled" | "failed";
  reason?: string;
}

const ToJSON = (val: unknown): Prisma.InputJsonValue => val as unknown as Prisma.InputJsonValue;

async function Handler(job: Job<EnrollmentJobMessage>) {
  const {
    jobId,
    schemaName,
    studentProgramId,
    studentId,
    currentSemesterId,
    currentStudentProgramLevelId,
    schedule,
  } = job.data;

  const prisma = GetTenantClient(schemaName);
  const submittedContextIds = schedule.scheduleSlots.map((s) => s.id);
  const outcomes: SlotOutcome[] = [];

  await prisma.enrollmentJob.update({
    where: { id: jobId },
    data: { status: EnrollmentJobStatus.Processing },
  });

  try {
    // ─── 2. Parallel fetch — slot contexts + academic load + already enrolled ──
    // All three are independent queries, no reason to run them sequentially.
    // Fetching via ScheduleSlotContext scoped to the student's programId and
    // semesterId also acts as a security check — a student cannot enroll in a
    // slot that does not belong to their program even if they know the slot ID.
    const [dbSlotsContexts, academicLoad, alreadyEnrolled, passedCoursesIds] = await Promise.all([

      prisma.scheduleSlotContext.findMany({
        where: {
          id: { in: submittedContextIds },
          programId: studentProgramId,
          semesterId: currentSemesterId,
        },
        include: {
          slot: {
            select: {
              id: true,
              enrolledSeats: true,
              classroom: { select: { capacity: true } },
              course: {
                select: { id: true, code: true, name: true, credits: true },
                include: { prerequisites: true }
              },
            }
          }
        }
      }),

      prisma.academicLoadSemester.findUnique({
        where: {
          programId_semesterNumber_programLevelId: {
            programId: studentProgramId,
            semesterNumber: currentSemesterId,
            programLevelId: currentStudentProgramLevelId,
          }
        },
        select: { minCredits: true, maxCredits: true },
      }),

      prisma.courseRegistration.findMany({
        where: {
          studentId,
          semesterId: currentSemesterId
        },
        select: {
          id: true, slotContextId: true,
          scheduleSlotContext: {
            select: {
              slot: {
                select: {
                  id: true,
                  classroom: { select: { capacity: true } },
                  course: {
                    select: { credits: true, id: true }
                  }
                }
              }
            }
          }
        },
      }),

      ScheduleRepository.getPassedCourseIds(studentId, prisma)

    ]);
    // ─── 3. Existence & Security Check ───
    if (dbSlotsContexts.length !== submittedContextIds.length) {
      const foundIds = new Set(dbSlotsContexts.map(c => c.id));
      const missingIds = submittedContextIds.filter(id => !foundIds.has(id));

      await prisma.enrollmentJob.update({
        where: { id: jobId },
        data: {
          status: EnrollmentJobStatus.Done,
          result: ToJSON({
            slots: missingIds.map(id => ({
              slotId: id,
              status: "failed",
              reason: "Slot not found or unauthorized access"
            }))
          })
        }
      });
      return;
    }

    // ─── 4. Identification (Drops vs Adds) ───
    //using a set to avoid duplication (course could be repeated(Lecture,Lab..etc))
    const submittedIdSet = new Set(submittedContextIds);
    const existingIdSet = new Set(alreadyEnrolled.map(r => r.slotContextId));

    const toDrop = alreadyEnrolled.filter(r => !submittedIdSet.has(r.slotContextId!));
    //it's candidate since they still need to be validated for certain conditions 
    const toAddCandidate = dbSlotsContexts.filter(ctx => !existingIdSet.has(ctx.id));

    // ─── 5. Eligibility & Credit Validation ───
    const eligibilityOutcomes: SlotOutcome[] = [];

    //student can only register new courses (not passed before already ) or if he passed all of the course's prerequisites 
    const validToAdd = toAddCandidate.filter(ctx => {
      const isPassed = passedCoursesIds.includes(ctx.slot.course.id);
      const unmetPrereq = ctx.slot.course.prerequisites.some(p => !passedCoursesIds.includes(p.prerequisiteId));

      if (isPassed || unmetPrereq) {
        eligibilityOutcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "failed",
          reason: isPassed ? "Course already passed" : "Prerequisites not met"
        });
        return false;
      }
      return true;
    });

    // Calculate  Credits 
    //credits calculation will be separated in 2 parts 
    //first part is the credits of the courses that he already enrolled this semeter (maybe in a previous request)
    //second part is the credits of the new courses that he wants to register now  (in the current request)

    //                       courseId, credits
    const creditsMap = new Map<number, number>();
    // Keepers 
    alreadyEnrolled.forEach(reg => {
      if (submittedIdSet.has(reg.slotContextId!)) {
        const course = reg.scheduleSlotContext!.slot.course;
        creditsMap.set(course.id, course.credits);
      }
    });
    // Additions
    validToAdd.forEach(ctx => {
      creditsMap.set(ctx.slot.course.id, ctx.slot.course.credits);
    });

    const totalCredits = Array.from(creditsMap.values()).reduce((a, b) => a + b, 0);

    if (!academicLoad || (totalCredits > academicLoad.maxCredits || totalCredits < academicLoad.minCredits)) {
      await prisma.enrollmentJob.update({
        where: { id: jobId },
        data: {
          status: EnrollmentJobStatus.Done,
          result: ToJSON({
            error: !academicLoad ? "Academic configuration missing" : `Credit limit violation: ${totalCredits} credits requested.`,
            slots: eligibilityOutcomes
          })
        }
      });
      return;
    }

    // ─── 6. Execution Phase ───

    // 6a. Process DROPS first (Freely decrements seats)
    for (const reg of toDrop) {
      try {
        await prisma.$transaction(async (tx) => {

          await tx.courseRegistration.delete({ where: { id: reg.id } });
          //free up this seat since the student changed his mind and removed it from his enrollment
          const updated = await tx.scheduleSlot.update({
            where: { id: reg.scheduleSlotContext!.slot.id },
            data: { enrolledSeats: { decrement: 1 } }
          });
          const remaining = (reg.scheduleSlotContext!.slot.classroom.capacity) - updated.enrolledSeats;
          await RedisPublisher.publish(Channels.StudentEnrollment, JSON.stringify({ slotId: updated.id, remainingSeats: remaining }));
        });
      } catch (err) {
        logger.error({ studentId, regId: reg.id, err, message: "Failed to drop course during sync" });
      }
    }

    // 6b. Process ADDS (Atomic Locking)
    for (const ctx of validToAdd) {
      // Stale seat check (optimization)
      if (ctx.slot.enrolledSeats >= ctx.slot.classroom.capacity) {
        outcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "failed",
          reason: "No available seats"
        });
        continue;
      }

      try {
        const remaining = await prisma.$transaction(async (tx) => {
          
          const slot = await tx.$queryRaw<any[]>`
            SELECT s."enrolled_seats", c."capacity" 
            FROM "${schemaName}"."ScheduleSlot" as s
            JOIN "${schemaName}"."Classroom" as c ON s."classroom_id" = c."id"
            WHERE s."id" = ${ctx.slotId}
            FOR UPDATE OF s
          `;

          if (slot[0].enrolled_seats >= slot[0].capacity) throw new Error("No available seats");

          await tx.courseRegistration.create({
            data: { studentId, slotContextId: ctx.id, semesterId: currentSemesterId }
          });

          const updated = await tx.scheduleSlot.update({
            where: { id: ctx.slotId },
            data: { enrolledSeats: { increment: 1 } }
          });

          return slot[0].capacity - updated.enrolledSeats;
        });

        outcomes.push({ slotId: ctx.slot.id, courseCode: ctx.slot.course.code, courseName: ctx.slot.course.name, status: "enrolled" });
        await RedisPublisher.publish(Channels.StudentEnrollment, JSON.stringify({ slotId: ctx.slotId, remainingSeats: remaining }));
      } catch (err: any) {
        outcomes.push({ slotId: ctx.slot.id, courseCode: ctx.slot.course.code, courseName: ctx.slot.course.name, status: "failed", reason: err.message });
      }
    }

    // ─── 7. Finalize ───
    await prisma.enrollmentJob.update({
      where: { id: jobId },
      data: {
        status: EnrollmentJobStatus.Done,
        result: ToJSON({ slots: [...outcomes, ...eligibilityOutcomes] }),
      },
    });

  } catch (err) {
    logger.error({ jobId, err, message: "Enrollment Worker Crashed" });
    await prisma.enrollmentJob.update({
      where: { id: jobId },
      data: {
        status: EnrollmentJobStatus.Done,
        result: ToJSON({ error: "Internal System Error", slots: outcomes }),
      },
    });
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
GetWorkerSingleton<EnrollmentJobMessage>(Queues.StudentEnrollment, Handler);

process.title = "Enrollment Worker";

logger.info({
  action: "Enrollment Worker",
  message: "Enrollment Worker Started....",
  processId: process.pid,
  processName: process.title,
});