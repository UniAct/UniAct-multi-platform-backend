import { LearningGroupRole, Prisma } from "@prisma/client";
import { LearningGroupRepository } from "../Repositories/LearningGroupRepository";
import { logger } from "../Utils/Logger";

export class LearningGroupService {

  public static async EnsureLearningGroupExistsWithOwner(
    courseId: number,
    semesterId: number,
    teacherId: number,
    tx: Prisma.TransactionClient
  ) {
    const existingGroup = await this.CheckLearningGroupExistence(courseId, semesterId, teacherId, tx);

    if (!existingGroup) {
      const course = await tx.course.findUnique({ where: { id: courseId }, select: { name: true } });
      await this.CreateLearningGroupWithOwner(
        courseId,
        semesterId,
        course?.name || 'Course',
        teacherId,
        LearningGroupRole.Owner,
        tx
      );
    } else if (existingGroup.members.length === 0) {
      await this.AddLearningGroupMember(existingGroup.id, teacherId, LearningGroupRole.Owner, tx);
    }
  }

  public static async HandleGroupOrOwnerCleanup(
    courseId: number,
    semesterId: number,
    teacherId: number,
    tx: Prisma.TransactionClient
  ) {
    const remainingGlobalSlotsForCourse = await tx.scheduleSlot.count({
      where: { courseId, semesterId }
    });

    if (remainingGlobalSlotsForCourse === 0) {
      await tx.learningGroup.deleteMany({
        where: { courseId, semesterId }
      });
      return;
    }

    const remainingSlotsForTeacher = await tx.scheduleSlot.count({
      where: { courseId, semesterId, teacherId }
    });

    if (remainingSlotsForTeacher === 0) {
      await tx.learningGroupMember.deleteMany({
        where: {
          userId: teacherId,
          group: { courseId, semesterId }
        }
      });
    }
  }

  public static async AddLearningGroupMember(
    groupId: number,
    userId: number,
    role: LearningGroupRole,
    tx: Prisma.TransactionClient
  ) {
    await tx.learningGroupMember.create({
      data: { learningGroupId: groupId, userId, role }
    });
  }

  public static async CheckLearningGroupExistence(
    courseId: number,
    semesterId: number,
    teacherId: number,
    tx: Prisma.TransactionClient
  ) {
    return tx.learningGroup.findUnique({
      where: { courseId_semesterId: { courseId, semesterId } },
      select: { id: true, members: { where: { userId: teacherId }, select: { userId: true } } }
    });
  }

  public static async CreateLearningGroupWithOwner(
    courseId: number,
    semesterId: number,
    courseName: string,
    memberId: number,
    role: LearningGroupRole,
    tx: Prisma.TransactionClient
  ) {
    const accessCode = this.GenerateAccessCode();

    await tx.learningGroup.create({
      data: {
        courseId,
        semesterId,
        groupName: `${courseName} Group`,
        accessCode,
        members: {
          create: { userId: memberId, role }
        }
      }
    });
  }

  public static GenerateAccessCode(): string {
    return crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
  }

  /**
   * Batch-add a student to multiple learning groups as Member.
   * Best-effort — never throws, since membership sync is a side feature
   * and must not block the enrollment outcome.
   */
  public static async BatchJoinGroups(
    studentId: number,
    groupIds: Set<number>,
    tx: Prisma.TransactionClient
  ) {
    if (groupIds.size === 0) return;

    try {
      await LearningGroupRepository.BulkAddMembers(
        [...groupIds].map((learningGroupId) => ({
          learningGroupId,
          userId: studentId,
          role: LearningGroupRole.Member,
        })),
        tx
      );
    } catch (err) {
      logger.error({
        studentId,
        groupIds: [...groupIds],
        err,
        message: "BatchJoinGroups failed",
      });
    }
  }

  /**
   * Batch-remove a student from multiple learning groups, skipping any
   * group where the student still has an active registration this semester,
   * or that also appears in `keepGroupIds` (e.g. dropped lecture but kept
   * lab of the same course).
   *
   * Best-effort — never throws.
   */
  public static async BatchLeaveGroups(
    studentId: number,
    semesterId: number,
    candidateLeaveGroupIds: Set<number>,
    keepGroupIds: Set<number>,
    tx: Prisma.TransactionClient
  ) {
    const leaveOnly = [...candidateLeaveGroupIds].filter(
      (id) => !keepGroupIds.has(id)
    );

    if (leaveOnly.length === 0) return;

    try {
      // todo: wrong behavior
      const stillActiveIds = await LearningGroupRepository.GetActiveGroupIdsForUser(
        studentId,
        semesterId,
        leaveOnly,
        tx
      );

      const toRemove = leaveOnly.filter((id) => !stillActiveIds.has(id));

      if (toRemove.length > 0) {
        await LearningGroupRepository.BulkRemoveMember(studentId, toRemove, tx);
      }
    } catch (err) {
      logger.error({
        studentId,
        semesterId,
        candidateLeaveGroupIds: [...candidateLeaveGroupIds],
        err,
        message: "BatchLeaveGroups failed",
      });
    }
  }
}