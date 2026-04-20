import { Job } from "bullmq";
import { Queues } from "../../Enums/Queues";
import { GetWorkerSingleton } from "../../Utils/BullMQConfig";
import { logger } from "../../Utils/Logger";
import { EnrollmentJobMessage } from "../../Interfaces/Enrollment/EnrollmentJobMessage";
import { GetTenantClient } from "../../Utils/prismaClient";
import { EnrollmentJobStatus, Prisma } from "@prisma/client";
import { RedisPublisher } from "../../Utils/RedisPubSub";
import { Channels } from "../../Enums/Channels";

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
  const submittedSlotIds = schedule.scheduleSlots.map((s) => s.id);
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
    const [dbSlots, academicLoad, alreadyEnrolled] = await Promise.all([

      prisma.scheduleSlotContext.findMany({
        where: {
          slotId: { in: submittedSlotIds },
          programId: studentProgramId,
          semesterId: currentSemesterId,
        },
        select: {
          id: true,
          slot: {
            select: {
              id: true,
              enrolledSeats: true,
              classroom: { select: { capacity: true } },
              course: { select: { id: true, code: true, name: true, credits: true } },
            }
          }
        }
      }),

      prisma.academicLoadSemester.findUnique({
        where: {
          programId_semesterId_programLevelId: {
            programId: studentProgramId,
            semesterId: currentSemesterId,
            programLevelId: currentStudentProgramLevelId,
          }
        },
        select: { minCredits: true, maxCredits: true },
      }),

      prisma.courseRegistration.findMany({
        where: {
          studentId,
          scheduleSlotContext: { semesterId: currentSemesterId },
        },
        select: { slotContextId: true },
      }),

    ]);

    // ─── 3. Validate all submitted slot IDs actually exist ────────────────────
    if (dbSlots.length !== submittedSlotIds.length) {
      const foundSlotIds = new Set(dbSlots.map((ctx) => ctx.slot.id));
      const missingIds = submittedSlotIds.filter((id) => !foundSlotIds.has(id));

      await prisma.enrollmentJob.update({
        where: { id: jobId },
        data: {
          status: EnrollmentJobStatus.Done,
          result: ToJSON({
            slots: missingIds.map((id) => ({
              slotId: id,
              status: "failed",
              reason: "Schedule slot not found or does not belong to your program",
            })),
          }),
        },
      });
      return;
    }

    // ─── 4. Sum credits by unique course ──────────────────────────────────────
    // A course may have multiple slot types (Lecture, Lab, Tutorial) — counted once
    const uniqueCourseCredits = new Map<number, number>();
    for (const ctx of dbSlots) {
      if (!uniqueCourseCredits.has(ctx.slot.course.id)) {
        uniqueCourseCredits.set(ctx.slot.course.id, ctx.slot.course.credits);
      }
    }
    const totalCredits = Array.from(uniqueCourseCredits.values()).reduce(
      (prev, curr) => prev + curr,
      0
    );

    // ─── 5. Validate academic load ────────────────────────────────────────────
    if (!academicLoad) {
      await prisma.enrollmentJob.update({
        where: { id: jobId },
        data: {
          status: EnrollmentJobStatus.Done,
          result: ToJSON({
            error: "Academic Load Configuration Not Found For This Semester And Level",
            slots: [],
          }),
        },
      });
      return;
    }

    if (totalCredits > academicLoad.maxCredits || totalCredits < academicLoad.minCredits) {
      await prisma.enrollmentJob.update({
        where: { id: jobId },
        data: {
          status: EnrollmentJobStatus.Done,
          result: ToJSON({
            error: `Total Credits (${totalCredits}) Must Be Between ${academicLoad.minCredits} And ${academicLoad.maxCredits}`,
            slots: [],
          }),
        },
      });
      return;
    }

    // ─── 6. Per-slot enrollment ────────────────────────────────────────────────
    const enrolledContextIds = new Set(alreadyEnrolled.map((r) => r.slotContextId));

    for (const ctx of dbSlots) {
      // 6a. Already registered in this exact slot context
      if (enrolledContextIds.has(ctx.id)) {
        outcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "failed",
          reason: "Already registered in this slot",
        });
        continue;
      }

      // 6b. Fast stale seat check — avoids hitting a transaction for a obviously full slot
      if (ctx.slot.enrolledSeats >= ctx.slot.classroom.capacity) {
        outcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "failed",
          reason: "No available seats",
        });
        continue;
      }

      // 6c. Enroll + increment seats atomically
      // The re-check inside the transaction is the real guard against race conditions.
      // enrolledSeats lives on the physical ScheduleSlot so it correctly reflects
      // occupancy across all programs sharing the same room.
      try {
        const remainingSeats = await prisma.$transaction(async (tx : Prisma.TransactionClient) => {
          const freshSlot = await tx.scheduleSlot.findUnique({
            where: { id: ctx.slot.id },
            select: {
              enrolledSeats: true,
              classroom: { select: { capacity: true } },
            },
          });

          if (!freshSlot || freshSlot.enrolledSeats >= freshSlot.classroom.capacity) {
            throw new Error("No available seats");
          }

          await tx.courseRegistration.create({
            data: {
              studentId,
              slotContextId: ctx.id,
              semesterId: currentSemesterId,
            },
          });

          await tx.scheduleSlot.update({
            where: { id: ctx.slot.id },
            data: { enrolledSeats: { increment: 1 } },
          });

          // freshSlot.enrolledSeats is the value before increment
          return freshSlot.classroom.capacity - freshSlot.enrolledSeats - 1;
        });

        // 6d. Publish on physical slotId — all programs sharing this room see the update
        await RedisPublisher.publish(
          Channels.StudentEnrollment,
          JSON.stringify({ slotId: ctx.slot.id, remainingSeats })
        ).catch((err) => {
          logger.warn({ slotId: ctx.slot.id, err, message: "Seat Update Publish Failed." });
        });

        outcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "enrolled",
        });

        enrolledContextIds.add(ctx.id);

      } catch (err) {
        outcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "failed",
          reason: err instanceof Error ? err.message : "Enrollment failed",
        });
      }
    }

    // ─── 7. Mark job Done with full result ────────────────────────────────────
    await prisma.enrollmentJob.update({
      where: { id: jobId },
      data: {
        status: EnrollmentJobStatus.Done,
        result: ToJSON({ slots: outcomes }),
      },
    });

  } catch (err) {
    logger.error({ jobId, err, message: "Enrollment Worker Crashed" });

    await prisma.enrollmentJob.update({
      where: { id: jobId },
      data: {
        status: EnrollmentJobStatus.Done,
        result: ToJSON({ error: "Unexpected worker error", slots: outcomes }),
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