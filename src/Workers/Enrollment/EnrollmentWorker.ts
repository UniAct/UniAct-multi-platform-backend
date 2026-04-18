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
 * 2. Fetch and validate submitted slots from DB
 * 3. Ensure all requested slots exist
 * 4. Calculate total credits (deduplicated per course)
 * 5. Validate against academic load constraints (min/max credits)
 * 6. Load already-enrolled slots to prevent duplicates
 * 7. Process each slot:
 *    - Skip if already enrolled
 *    - Check seat availability
 *    - Execute enrollment + seat increment in a transaction
 *    - Publish seat updates for real-time systems
 * 8. Mark job as "Done" with detailed results
 *
 * Concurrency & Consistency:
 * - Uses database transactions to prevent race conditions during seat allocation
 * - Re-checks seat availability inside the transaction for correctness under concurrent requests
 *
 * Failure Handling:
 * - Gracefully handles partial failures (per-slot outcomes)
 * - Captures unexpected errors and marks job as completed with error details
 *
 * Notes:
 * - Academic load lookup should be cached to reduce DB load
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

async function Handler(job: Job<EnrollmentJobMessage>) {
  const { 
    jobId, 
    schemaName , 
    studentProgramId , 
    studentId, 
    currentSemesterId, 
    currentStudentProgramLevelId, 
    schedule 
  } = job.data;
  const prisma = GetTenantClient(schemaName);
  const submittedSlotIds = schedule.scheduleSlots.map(s => s.id);
  const outcomes: SlotOutcome[] = [];

  // ─── 1. Mark job as Processing ────────────────────────────────────────────
  await prisma.enrollmentJob.update({
    where: { id: jobId },
    data: { status: EnrollmentJobStatus.Processing },
  });

  try {
    // ─── 2. Fetch all submitted slots from DB (never trust client data (A malicious student could intercept the request and tamper with the payload before it hits)) ───────
    const dbSlots = await prisma.scheduleSlot.findMany({
      where: { id: { in: submittedSlotIds } },
      select: {
        id: true,
        enrolledSeats: true,
        classroom: { select: { capacity: true } },
        course: { select: { id: true, code: true, name: true, credits: true } },
      },
    });

    // ─── 3. Validate all submitted slot IDs actually exist ────────────────────
    if (dbSlots.length !== submittedSlotIds.length) {
      const foundIds = new Set(dbSlots.map((s) => s.id));
      const missingIds = submittedSlotIds.filter((id) => !foundIds.has(id));

      await prisma.enrollmentJob.update({
        where: { id: jobId },
        data: {
          status: EnrollmentJobStatus.Done,
          result: {
            slots: missingIds.map(id => ({
              slotId: id,
              status: "failed",
              reason: "Schedule slot not found",
            })),
          },
        },
      });
      return;
    }

    // ─── 4. Sum credits by unique course (Lecture + Lab + Tutorial , Lecture + Lab , Lecture + Tutorial = 1 course) ───
    const uniqueCourseCredits = new Map<number, number>(); // course id --> total credits
    for (const slot of dbSlots) {
      if (!uniqueCourseCredits.has(slot.course.id)) {
        uniqueCourseCredits.set(slot.course.id, slot.course.credits);
      }
    }
    const totalCredits = Array.from(uniqueCourseCredits.values()).reduce((previousValue , currentValue) => previousValue + currentValue , 0)

    // ─── 5. Check against AcademicLoadSemester ─────
    // TODO: will be cached latter
    const academicLoad = await prisma.academicLoadSemester.findUnique({
      where: {
        programId_semesterId_programLevelId: {
          programId: studentProgramId,
          semesterId: currentSemesterId,
          programLevelId: currentStudentProgramLevelId,
        },
      },
      select: { minCredits: true, maxCredits: true },
    });

    if (!academicLoad) {
      await prisma.enrollmentJob.update({
        where: { id: jobId },
        data: {
          status: EnrollmentJobStatus.Done,
          result: {
            error: "Academic Load Configuration Not Found For This Semester And Level",
            slots: [],
          },
        },
      });
      return;
    }
      
  if (totalCredits > academicLoad.maxCredits || totalCredits < academicLoad.minCredits) {
    await prisma.enrollmentJob.update({
      where: { id: jobId },
      data: {
        status: EnrollmentJobStatus.Done,
        result: {
          error: `Total Credits (${totalCredits} Must Be Between ${academicLoad.minCredits} And ${academicLoad.maxCredits})`,
          slots: [],
        },
      },
    });
    return;
  }

    // ─── 6. Fetch already-enrolled slots for this student in the current semester ───
    // Prevent duplicate registrations and inconsistent seat counts.
    // This ensures a student cannot enroll in the same slot more than once.
    const alreadyEnrolled = await prisma.courseRegistration.findMany({
      where: { studentId, ScheduleSlot: { semesterId: currentSemesterId } },
      select: { scheduleSlotId: true },
    });
    const enrolledSlotIds = new Set(alreadyEnrolled.map((r) => r.scheduleSlotId));

    // ─── 7. Per-slot enrollment ────────────────────────────────────────────────
    for (const slot of dbSlots) {
      // 7a. Already registered in this exact slot
      if (enrolledSlotIds.has(slot.id)) {
        outcomes.push({
          slotId: slot.id,
          courseCode: slot.course.code,
          courseName: slot.course.name,
          status: "failed",
          reason: "Already registered in this slot",
        });
        continue;
      }

      // 7b. Seat availability check
      if (slot.enrolledSeats >= slot.classroom.capacity) {
        outcomes.push({
          slotId: slot.id,
          courseCode: slot.course.code,
          courseName: slot.course.name,
          status: "failed",
          reason: "No available seats",
        });
        continue;
      }

      // 7c. Enroll + increment seats atomically in a transaction
      try {
        await prisma.$transaction(async (tx) => {
          // Re-check seats inside transaction to prevent race conditions
          const freshSlot = await tx.scheduleSlot.findUnique({
            where: { id: slot.id },
            select: { enrolledSeats: true, classroom: { select: { capacity: true } } },
          });


          if (!freshSlot || freshSlot.enrolledSeats >= freshSlot.classroom.capacity) {
            throw new Error("No available seats");
          }

          await tx.courseRegistration.create({
            data: {
              studentId,
              scheduleSlotId: slot.id,
              semesterId: currentSemesterId,
            },
          });

          await tx.scheduleSlot.update({
            where: { id: slot.id },
            data: { enrolledSeats: { increment: 1 } },
          });
        });
        
        // slot.enrolledSeats is the old value not the new one
        const remainingSeats = slot.classroom.capacity - slot.enrolledSeats - 1;
        
        // 7d. Publish seat update event via Redis pub/sub
        // Used to propagate real-time seat availability changes to subscribed clients through the WebSocket layer
        await RedisPublisher.publish(
          Channels.StudentEnrollment,
          JSON.stringify({ slotId: slot.id, remainingSeats })
        )
        .catch(err => {
          logger.warn({
            slotId: slot.id,
            err,
            message: "Seat Update Publish Failed."
          });
        });

        outcomes.push({
          slotId: slot.id,
          courseCode: slot.course.code,
          courseName: slot.course.name,
          status: "enrolled",
        });

        // Track for subsequent slots in this same job
        enrolledSlotIds.add(slot.id);

      } catch (err) {
        outcomes.push({
          slotId: slot.id,
          courseCode: slot.course.code,
          courseName: slot.course.name,
          status: "failed",
          reason: err instanceof Error ? err.message : "Enrollment failed",
        });
      }
    }

    // ─── 8. Mark job Done with full result ────────────────────────────────────
    await prisma.enrollmentJob.update({
      where: { id: jobId },
      data: {
        status: EnrollmentJobStatus.Done,
        result: { slots: outcomes }  as unknown as Prisma.InputJsonValue
      },
    });

  } catch (err) {
    logger.error({ jobId, err, message: "Enrollment worker crashed" });

    await prisma.enrollmentJob.update({
      where: { id: jobId },
      data: {
        status: EnrollmentJobStatus.Done,
        result: { error: "Unexpected worker error", slots: outcomes } as unknown as Prisma.InputJsonValue
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
  processName: process.title
});