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
import { ProgramRepository } from "../../Repositories/ProgramRepository";
import { CourseRepository } from "../../Repositories/CourseRepository";


interface SlotOutcome {
  slotId: number;
  courseCode: string;
  courseName: string;
  status: "enrolled" | "dropped" | "failed";
  reason?: string;
}

const ToJSON = (val: unknown): Prisma.InputJsonValue =>
  val as unknown as Prisma.InputJsonValue;


async function Handler(job: Job<EnrollmentJobMessage>) {
  const {
    jobId,
    schemaName,
    studentProgramId,
    studentId,
    cgpa,
    currentStudentProgramLevelId,
    semester,
    schedule,
  } = job.data;

  if (!semester?.id || !semester?.term) {
    logger.error({ jobId, message: "Missing semester in job payload" });
    return;
  }

  const prisma = GetTenantClient(schemaName);
  const submittedContextIds = schedule.scheduleSlots.map((s) => s.id);
  const outcomes: SlotOutcome[] = [];

  await prisma.enrollmentJob.update({
    where: { id: jobId },
    data: { status: EnrollmentJobStatus.Processing },
  });

  try {
    // ─── 1. Parallel fetch ────────────────────────────────────────────────────
    const [dbSlotContexts, academicLoadSemester , academicLoadGpa , alreadyEnrolled, passedCourseIds] =
      await Promise.all([
        ScheduleRepository.GetRequestedScheduleSlotContexts(
          prisma,
          submittedContextIds,
          studentProgramId,
          semester.id
        ),
        ProgramRepository.GetAcademicLoadCreditsBySemester(
          prisma,
          studentProgramId,
          semester.term,
          currentStudentProgramLevelId
        ),
        ProgramRepository.GetAcademicLoadCreditsByGPA(
          prisma,
          studentProgramId,
          cgpa
        ),
        CourseRepository.GetStudentAlreadyEnrolledCourses(
          prisma, 
          studentId, 
          semester.id
        ),
        CourseRepository.GetStudentPassedCourseIds(
          studentId, 
          prisma
        ),
      ]);

    // ─── 2. Security check — all submitted slot contexts must exist in this program ──
    if (dbSlotContexts.length !== submittedContextIds.length) {
      const foundIds = new Set(dbSlotContexts.map((c) => c.id));
      const missingIds = submittedContextIds.filter((id) => !foundIds.has(id));
      await prisma.enrollmentJob.update({
        where: { id: jobId },
        data: {
          status: EnrollmentJobStatus.Done,
          result: ToJSON({
            slots: missingIds.map((id) => ({
              slotId: id,
              status: "failed",
              reason: "Not Found",
            })),
          }),
        },
      });
      return;
    }

    // ─── 3. Identify drops vs adds ───────────────────────────────────────────
    const submittedIdSet = new Set(submittedContextIds);
    const existingIdSet = new Set(alreadyEnrolled.map((r) => r.slotContextId));

    const toDrop = alreadyEnrolled.filter(
      (r) => !submittedIdSet.has(r.slotContextId!)
    );
    const toAddCandidates = dbSlotContexts.filter(
      (ctx) => !existingIdSet.has(ctx.id)
    );

    // ─── 4. Eligibility check — prerequisites & already-passed courses ────────
    const eligibilityOutcomes: SlotOutcome[] = [];

    const validToAdd = toAddCandidates.filter((ctx) => {
      const alreadyPassed = passedCourseIds.includes(ctx.slot.course.id);

      const hasUnmetPrereq = ctx.slot.course.prerequisites.some(
        (p) => !passedCourseIds.includes(p.prerequisiteId)
      );

      if (alreadyPassed || hasUnmetPrereq) {
        eligibilityOutcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "failed",
          reason: alreadyPassed ? "Course Already Passed" : "Prerequisites Not Met",
        });
        return false;
      }
      return true;
    });

    // ─── 5. Credit calculation ────────────────────────────────────────────────
    const creditsMap = new Map<number, number>();

    alreadyEnrolled.forEach((reg) => {
      if (submittedIdSet.has(reg.slotContextId!)) {
        const course = reg.scheduleSlotContext!.slot.course;
        creditsMap.set(course.id, course.credits);
      }
    });

    validToAdd.forEach((ctx) => {
      creditsMap.set(ctx.slot.course.id, ctx.slot.course.credits);
    });

    const totalCredits = Array.from(creditsMap.values()).reduce(
      (sum, c) => sum + c,
      0
    );

    // Determine the effective allowed range — both rules must pass
    const effectiveMin = Math.max(
      academicLoadSemester?.minCredits ?? 0,
      academicLoadGpa?.minCredits ?? 0
    );
    const effectiveMax = Math.min(
      academicLoadSemester?.maxCredits ?? Infinity,
      academicLoadGpa?.maxCredits ?? Infinity
    );

    const semesterMissing = !academicLoadSemester ;
    const gpaMissing      = !academicLoadGpa;

    if (
      semesterMissing ||
      gpaMissing ||
      totalCredits < effectiveMin ||
      totalCredits > effectiveMax
    ) {
      await prisma.enrollmentJob.update({
        where: { id: jobId },
        data: {
          status: EnrollmentJobStatus.Done,
          result: ToJSON({
            error: semesterMissing
              ? "Academic Load (Semester) Configuration Missing"
              : gpaMissing
              ? "Academic Load (GPA) Configuration Missing"
              : `Credit Limit Violation: ${totalCredits} credits requested (allowed ${effectiveMin}–${effectiveMax})`,
            slots: eligibilityOutcomes,
          }),
        },
      });
      return;
    }

    // ─── 6a. Process drops ────────────────────────────────────────────────────
    for (const reg of toDrop) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.courseRegistration.delete({ where: { id: reg.id } });

          const updated = await tx.scheduleSlot.update({
            where: { id: reg.scheduleSlotContext!.slot.id },
            data: { enrolledSeats: { decrement: 1 } },
          });
          
          /**
           * safer solution (in case of admin adjust the capacity every time)
           * const updated = await tx.scheduleSlot.update({
           *   where: { id: reg.scheduleSlotContext!.slot.id },
           *   data: { enrolledSeats: { decrement: 1 } },
           *   select: { id: true, enrolledSeats: true, allowedCapacity: true }, 
           * });
           * const remaining = updated.allowedCapacity - updated.enrolledSeats; 
           */

          // allowedCapacity is admin-configured and changes only when an admin
          // explicitly adjusts slot capacity — never during active enrollment.
          // Reading it from the pre-fetched snapshot is safe here.
          const remaining =
            reg.scheduleSlotContext!.slot.allowedCapacity -
            updated.enrolledSeats;

          await RedisPublisher.publish(
            Channels.StudentEnrollment,
            JSON.stringify({ slotId: updated.id, remainingSeats: remaining })
          );
        });

        outcomes.push({
          slotId:     reg.scheduleSlotContext!.slot.id,
          courseCode: reg.scheduleSlotContext?.slot.course.code!,
          courseName: reg.scheduleSlotContext?.slot.course.name!,
          status: "dropped",
        });
      } catch (err) {
        logger.error({ studentId, regId: reg.id, err, message: "Drop failed" });
        outcomes.push({
          slotId: reg.scheduleSlotContext!.slot.id,
          courseCode: reg.scheduleSlotContext?.slot.course.code!,
          courseName: reg.scheduleSlotContext?.slot.course.name!,
          status: "failed",
          reason: "Failed to drop course",
        });
      }
    }

    // ─── 6b. Process adds ────────────────────────────────────────────────────
    for (const ctx of validToAdd) {
      // Stale pre-check (optimistic early exit — real guard is inside the tx)
      if (ctx.slot.enrolledSeats >= ctx.slot.allowedCapacity) {
        outcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "failed",
          reason: "No available seats",
        });
        continue;
      }

      try {
        const remaining = await prisma.$transaction(async (tx) => {
          const [slot] = await tx.$queryRaw<
            { enrolled_seats: number; allowed_capacity: number }[]
          >`
            SELECT s."enrolled_seats", s."allowedCapacity" AS "allowed_capacity"
            FROM ${Prisma.raw(`"${schemaName}"."ScheduleSlot"`)} AS s
            WHERE s."id" = ${ctx.slotId}
            FOR UPDATE OF s
          `;

          if (slot.enrolled_seats >= slot.allowed_capacity) {
            throw new Error("No available seats");
          }

          await tx.courseRegistration.create({
            data: {
              studentId,
              slotContextId: ctx.id,
              semesterId: semester.id,
            },
          });

          const updated = await tx.scheduleSlot.update({
            where: { id: ctx.slotId },
            data: { enrolledSeats: { increment: 1 } },
          });

          return slot.allowed_capacity - updated.enrolledSeats;
        });

        outcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "enrolled",
        });

        await RedisPublisher.publish(
          Channels.StudentEnrollment,
          JSON.stringify({ slotId: ctx.slotId, remainingSeats: remaining })
        );
      } catch (err: any) {
        outcomes.push({
          slotId: ctx.slot.id,
          courseCode: ctx.slot.course.code,
          courseName: ctx.slot.course.name,
          status: "failed",
          reason: err.message,
        });
      }
    }

    await prisma.enrollmentJob.update({
      where: { id: jobId },
      data: {
        status: EnrollmentJobStatus.Done,
        result: ToJSON({ slots: [...outcomes, ...eligibilityOutcomes] }),
      },
    });
  } catch (err) {
    logger.error({ jobId, err, message: "Enrollment worker crashed" });
    await prisma.enrollmentJob.update({
      where: { id: jobId },
      data: {
        status: EnrollmentJobStatus.Done,
        result: ToJSON({ error: "Internal system error", slots: outcomes }),
      },
    });
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

GetWorkerSingleton<EnrollmentJobMessage>(Queues.StudentEnrollment, Handler);

process.title = "Enrollment Worker";

logger.info({
  message: "Enrollment Worker Started....",
  processId: process.pid,
  processName: process.title,
});