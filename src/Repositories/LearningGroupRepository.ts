import { Prisma, LearningGroupRole } from "@prisma/client";

export class LearningGroupRepository {

  public static async BulkAddMembers(
    members: { learningGroupId: number; userId: number; role: LearningGroupRole }[],
    tx: Prisma.TransactionClient
  ) {
    if (members.length === 0) return;

    return tx.learningGroupMember.createMany({
      data: members,
      skipDuplicates: true,
    });
  }

  public static async BulkRemoveMember(
    userId: number,
    learningGroupIds: number[],
    tx: Prisma.TransactionClient
  ) {
    if (learningGroupIds.length === 0) return;

    return tx.learningGroupMember.deleteMany({
      where: {
        userId,
        learningGroupId: { in: learningGroupIds },
      },
    });
  }

  public static async GetActiveGroupIdsForUser(
    studentId: number,
    semesterId: number,
    candidateGroupIds: number[],
    tx: Prisma.TransactionClient
  ): Promise<Set<number>> {
    if (candidateGroupIds.length === 0) return new Set();

    const stillActive = await tx.courseRegistration.findMany({
      where: {
        studentId,
        semesterId,
        scheduleSlotContext: {
          slot: {
            course: {
              learningGroups: { some: { id: { in: candidateGroupIds } } },
            },
          },
        },
      },
      select: {
        scheduleSlotContext: {
          select: {
            slot: {
              select: {
                course: {
                  select: { learningGroups: { select: { id: true } } },
                },
              },
            },
          },
        },
      },
    });

    const activeIds = stillActive.flatMap((r) =>
      r.scheduleSlotContext!.slot.course.learningGroups.map((g) => g.id)
    );

    return new Set(activeIds);
  }
}