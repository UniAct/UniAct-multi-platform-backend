import { Prisma, LearningGroupRole, PrismaClient, PostType } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

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

  static async GetGroupsForUser(
    userId: number,
    semesterId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupMember.findMany({
      where: {
        userId,
        group: { semesterId },
      },
      select: {
        role: true,
        group: {
          select: {
            id: true,
            groupName: true,
            accessCode: true,
            allowStudentPosts: true,
            course: {
              select: { id: true, code: true, name: true, credits: true },
            },
          },
        },
      },
      orderBy: { group: { groupName: "asc" } },
    });
  }

  static async FindMembership(
    groupId: number,
    userId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupMember.findUnique({
      where: {
        learningGroupId_userId: { learningGroupId: groupId, userId },
      },
      select: { role: true },
    });
  }

  static async GetGroupDetails(
    groupId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroup.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        groupName: true,
        accessCode: true,
        allowStudentPosts: true,
        createdAt: true,
        course: {
          select: { id: true, code: true, name: true, credits: true },
        },
        semester: {
          select: { id: true, year: true, term: true, type: true },
        },
        members: {
          select: { userId: true, role: true },
        },
      },
    });
  }

  static async GetGroupMembers(
    groupId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupMember.findMany({
      where: { learningGroupId: groupId },
      select: {
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },     
        { joinedAt: "asc" },
      ],
    });
  }

  static async FindGroupByAccessCode(
    accessCode: string,
    prisma: DbClient
  ) {
    return prisma.learningGroup.findFirst({
      where: { accessCode },
      select: { id: true, groupName: true },
    });
  }

  static async AddMember(
    groupId: number,
    userId: number,
    role: LearningGroupRole,
    prisma: DbClient
  ) {
    return prisma.learningGroupMember.create({
      data: { learningGroupId: groupId, userId, role },
    });
  }

  static async CreatePostWithAttachments(
    groupId: number,
    authorId: number,
    postType: PostType,
    content: string | undefined,
    dueDate: Date | undefined,
    attachments: { fileName: string; fileType: string; storagePath: string; fileSize: number }[],
    prisma: DbClient
  ) {
    return prisma.learningGroupPost.create({
      data: {
        learningGroupId: groupId,
        authorId,
        postType,
        content,
        dueDate,
        attachments: {
          create: attachments.map((a) => ({
            fileName: a.fileName,
            fileType: a.fileType,
            storageProvider: "Cloudinary",
            storagePath: a.storagePath,
            fileSize: a.fileSize,
          })),
        },
      },
      select: {
        id: true,
        postType: true,
        content: true,
        dueDate: true,
        isPinned: true,
        isEdited: true,
        createdAt: true,
        attachments: {
          select: { id: true, fileName: true, fileType: true, storagePath: true, fileSize: true },
        },
      },
    });
  }

  static async CanUserPost(
    groupId: number,
    userId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupMember.findUnique({
      where: { learningGroupId_userId: { learningGroupId: groupId, userId } },
      select: {
        role: true,
        group: { select: { allowStudentPosts: true } },
      },
    });
  }

  static async GetGroupPosts(
    groupId: number,
    postType: PostType | undefined,
    pageNumber: number,
    pageSize: number,
    prisma: DbClient
  ) {
    const where: Prisma.LearningGroupPostWhereInput = {
      learningGroupId: groupId,
      ...(postType ? { postType } : {}),
    };

    const [items, totalCount] = await Promise.all([
      prisma.learningGroupPost.findMany({
        where,
        select: {
          id: true,
          postType: true,
          content: true,
          dueDate: true,
          isPinned: true,
          isEdited: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
          attachments: {
            select: { id: true, fileName: true, fileType: true, storagePath: true, fileSize: true },
          },
          _count: { select: { comments: true } },
        },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),
      prisma.learningGroupPost.count({ where }),
    ]);

    return { items, totalCount };
  }

  static async FindPostForUpdate(
    postId: number,
    groupId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupPost.findFirst({
      where: { id: postId, learningGroupId: groupId },
      select: {
        id: true,
        authorId: true,
        postType: true,
        attachments: { select: { id: true, storagePath: true } },
      },
    });
  }

  static async UpdatePostContent(
    postId: number,
    content: string | undefined,
    dueDate: Date | undefined,
    prisma: DbClient
  ) {
    return prisma.learningGroupPost.update({
      where: { id: postId },
      data: {
        ...(content !== undefined ? { content } : {}),
        ...(dueDate !== undefined ? { dueDate } : {}),
        isEdited: true,
      },
      select: {
        id: true,
        postType: true,
        content: true,
        dueDate: true,
        isPinned: true,
        isEdited: true,
        createdAt: true,
        updatedAt: true,
        attachments: {
          select: { id: true, fileName: true, fileType: true, storagePath: true, fileSize: true },
        },
      },
    });
  }

  static async DeleteAttachments(
    attachmentIds: number[],
    postId: number,
    prisma: DbClient
  ) {
    if (attachmentIds.length === 0) return;

    return prisma.learningGroupPostAttachment.deleteMany({
      where: { id: { in: attachmentIds }, postId },
    });
  }

  static async AddAttachments(
    postId: number,
    attachments: { fileName: string; fileType: string; storagePath: string; fileSize: number }[],
    prisma: DbClient
  ) {
    if (attachments.length === 0) return;

    return prisma.learningGroupPostAttachment.createMany({
      data: attachments.map((a) => ({
        postId,
        fileName: a.fileName,
        fileType: a.fileType,
        storageProvider: "Cloudinary",
        storagePath: a.storagePath,
        fileSize: a.fileSize,
      })),
    });
  }

  static async FindPostForDelete(
    postId: number,
    groupId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupPost.findFirst({
      where: { id: postId, learningGroupId: groupId },
      select: {
        id: true,
        authorId: true,
        attachments: { select: { id: true, storagePath: true } },
      },
    });
  }

  static async DeletePost(
    postId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupPost.delete({
      where: { id: postId },
    });
  }

  static async TogglePinPost(
    postId: number,
    groupId: number,
    prisma: DbClient
  ) {
    const post = await prisma.learningGroupPost.findFirst({
      where: { id: postId, learningGroupId: groupId },
      select: { id: true, isPinned: true },
    });

    if (!post) return null;

    return prisma.learningGroupPost.update({
      where: { id: postId },
      data: { isPinned: !post.isPinned },
      select: {
        id: true,
        postType: true,
        content: true,
        isPinned: true,
        isEdited: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async GetPostComments(
    postId: number,
    groupId: number,
    prisma: DbClient
  ) {
    const post = await prisma.learningGroupPost.findFirst({
      where: { id: postId, learningGroupId: groupId },
      select: { id: true },
    });

    if (!post) return null;

    const comments = await prisma.learningGroupPostComment.findMany({
      where: { postId },
      select: {
        id: true,
        content: true,
        isEdited: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return comments;
  }

  static async FindPostInGroup(
    postId: number,
    groupId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupPost.findFirst({
      where: { id: postId, learningGroupId: groupId },
      select: { id: true },
    });
  }

  static async CreateComment(
    postId: number,
    authorId: number,
    content: string,
    prisma: DbClient
  ) {
    return prisma.learningGroupPostComment.create({
      data: { postId, authorId, content },
      select: {
        id: true,
        content: true,
        isEdited: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  static async FindCommentForDelete(
    commentId: number,
    postId: number,
    groupId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupPostComment.findFirst({
      where: {
        id: commentId,
        postId,
        post: { learningGroupId: groupId }, // guards against cross-group/cross-post comment IDs
      },
      select: { id: true, authorId: true },
    });
  }

  static async DeleteComment(
    commentId: number,
    prisma: DbClient
  ) {
    return prisma.learningGroupPostComment.delete({
      where: { id: commentId },
    });
  }
}