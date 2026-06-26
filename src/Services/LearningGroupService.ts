import { LearningGroupRole, Prisma } from "@prisma/client";
import { LearningGroupRepository } from "../Repositories/LearningGroupRepository";
import { logger } from "../Utils/Logger";
import { GetTenantClient } from "../Utils/prismaClient";
import { ConflictError, ForbiddenError, NotFoundError } from "../Types/Errors";
import { MapLearningGroupDetails } from "../Interfaces/LearningGroup/GetGroupDetails/Mapper";
import { MapLearningGroupMembers } from "../Interfaces/LearningGroup/GetGroupMembers/Mapper";
import { CreatePostDto } from "../Interfaces/LearningGroup/UploadPosts/CreatePostRequest";
import { deleteFromCloudinary, UploadRawFileToCloudinary } from "../Utils/ImageUpload";
import { MapCreatedPost } from "../Interfaces/LearningGroup/UploadPosts/Mapper";
import { GetPostsQueryDto } from "../Interfaces/LearningGroup/GetPosts/GetPostsRequest";
import { IPage } from "../Interfaces/Common/PaginatedList";
import { MapGroupPosts, PostDto } from "../Interfaces/LearningGroup/GetPosts/Mapper";
import { UpdatePostDto } from "../Interfaces/LearningGroup/UpdatePost/UpdatePostRequest";
import { MapUpdatedPost } from "../Interfaces/LearningGroup/UpdatePost/Mapper";
import { MapTogglePinPost } from "../Interfaces/LearningGroup/TogglePinPost/Mapper";
import { MapPostComments } from "../Interfaces/LearningGroup/GetPostComment/Mapper";
import { MapCreatedComment } from "../Interfaces/LearningGroup/CreateComment/Mapper";
import { MapMyLearningGroups } from "../Interfaces/LearningGroup/GetMyGroups/GetMyGroupsMapper";
import { SemesterRepository } from "../Repositories/SemesterRepository";

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

  public static async GetMyGroups(
    schemaName: string,
    userId: number,
    semesterId?: number
  ) {
    const prisma = GetTenantClient(schemaName);
    const resolvedSemesterId = Number.isInteger(semesterId) && semesterId! > 0
      ? semesterId!
      : (await SemesterRepository.GetCurrentSemester(prisma, { id: true }))?.id;

    if (!resolvedSemesterId) {
      throw new NotFoundError("No active semester is configured for this university.");
    }

    const groups = await LearningGroupRepository.GetGroupsForUser(
      userId,
      resolvedSemesterId,
      prisma
    );

    logger.info({
      action: "LearningGroupService.GetMyGroups",
      status: "success",
      schema: schemaName,
      userId,
      semesterId: resolvedSemesterId,
      groupCount: groups.length,
    });

    return MapMyLearningGroups(groups);
  }

  public static async GetGroupDetails(
    schemaName: string,
    groupId: number,
    requestingUserId: number
  ) {
    const prisma = GetTenantClient(schemaName);

    const rawGroup = await LearningGroupRepository.GetGroupDetails(groupId, prisma);

    if (!rawGroup) {
      throw new NotFoundError("Learning group not found.");
    }

    const group = MapLearningGroupDetails(rawGroup, requestingUserId);

    logger.info({
      action: "LearningGroupService.GetGroupDetails",
      status: "success",
      schema: schemaName,
      groupId,
      requestingUserId,
    });

    return group;
  }

  public static async GetGroupMembers(
    schemaName: string,
    groupId: number
  ) {
    const prisma = GetTenantClient(schemaName);

    const rawMembers = await LearningGroupRepository.GetGroupMembers(groupId, prisma);

    const members = MapLearningGroupMembers(rawMembers);

    logger.info({
      action: "LearningGroupService.GetGroupMembers",
      status: "success",
      schema: schemaName,
      groupId,
      memberCount: members.length,
    });

    return members;
  }

  public static async JoinByAccessCode(
    schemaName: string,
    userId: number,
    accessCode: string
  ) {
    const prisma = GetTenantClient(schemaName);

    const group = await LearningGroupRepository.FindGroupByAccessCode(accessCode, prisma);

    if (!group) {
      throw new NotFoundError("Invalid access code.");
    }

    const existingMembership = await LearningGroupRepository.FindMembership(
      group.id,
      userId,
      prisma
    );

    if (existingMembership) {
      throw new ConflictError("You are already a member of this learning group.");
    }

    await LearningGroupRepository.AddMember(
      group.id,
      userId,
      LearningGroupRole.Member,
      prisma
    );

    logger.info({
      action: "LearningGroupService.JoinByAccessCode",
      status: "success",
      schema: schemaName,
      userId,
      groupId: group.id,
    });

    return { groupId: group.id, groupName: group.groupName };
  }

  public static async CreatePost(
    schemaName: string,
    groupId: number,
    authorId: number,
    data: CreatePostDto,
    files: Express.Multer.File[]
  ) {
    const prisma = GetTenantClient(schemaName);

    const membership = await LearningGroupRepository.CanUserPost(groupId, authorId, prisma);

    if (!membership) {
      throw new NotFoundError("Learning group not found.");
    }

    if (membership.role !== "Owner" && !membership.group.allowStudentPosts) {
      throw new ForbiddenError("Members are not allowed to post in this group.");
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const { url } = await UploadRawFileToCloudinary(
          file.buffer,
          `${schemaName}/learning-groups/${groupId}/posts`,
          file.originalname
        );

        return {
          fileName: file.originalname,
          fileType: file.mimetype,
          storagePath: url,
          fileSize: file.size,
        };
      })
    );

    const rawPost = await LearningGroupRepository.CreatePostWithAttachments(
      groupId,
      authorId,
      data.postType,
      data.content,
      data.dueDate ? new Date(data.dueDate) : undefined,
      uploadedFiles,
      prisma
    );

    const post = MapCreatedPost(rawPost);

    logger.info({
      action: "LearningGroupService.CreatePost",
      status: "success",
      schema: schemaName,
      groupId,
      authorId,
      postType: data.postType,
      fileCount: uploadedFiles.length,
    });

    return post;
  }

  public static async GetGroupPosts(
    schemaName: string,
    groupId: number,
    query: GetPostsQueryDto
  ): Promise<IPage<PostDto>> {
    const prisma = GetTenantClient(schemaName);

    const rawResult = await LearningGroupRepository.GetGroupPosts(
      groupId,
      query.postType,
      query.pageNumber,
      query.pageSize,
      prisma
    );

    const page = MapGroupPosts(rawResult, query.pageNumber, query.pageSize);

    logger.info({
      action: "LearningGroupService.GetGroupPosts",
      status: "success",
      schema: schemaName,
      groupId,
      postType: query.postType,
      pageNumber: query.pageNumber,
      returned: page.items?.length ?? 0,
    });

    return page;
  }

  public static async UpdatePost(
    schemaName: string,
    groupId: number,
    postId: number,
    authorId: number,
    data: UpdatePostDto,
    newFiles: Express.Multer.File[]
  ) {
    const prisma = GetTenantClient(schemaName);

    const post = await LearningGroupRepository.FindPostForUpdate(postId, groupId, prisma);

    if (!post) {
      throw new NotFoundError("Post not found.");
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenError("Only the original author can update this post.");
    }

    const validRemoveIds = data.removeAttachmentIds.filter((id) =>
      post.attachments.some((a) => a.id === id)
    );

    if (validRemoveIds.length > 0) {
      const toDelete = post.attachments.filter((a) => validRemoveIds.includes(a.id));

      await Promise.all(
        toDelete.map((a) => deleteFromCloudinary(a.storagePath))
      );

      await LearningGroupRepository.DeleteAttachments(validRemoveIds, postId, prisma);
    }

    if (newFiles.length > 0) {
      const uploadedFiles = await Promise.all(
        newFiles.map(async (file) => {
          const { url } = await UploadRawFileToCloudinary(
            file.buffer,
            `learning-groups/${groupId}/posts`,
            file.originalname
          );

          return {
            fileName: file.originalname,
            fileType: file.mimetype,
            storagePath: url,
            fileSize: file.size,
          };
        })
      );

      await LearningGroupRepository.AddAttachments(postId, uploadedFiles, prisma);
    }

    const rawUpdated = await LearningGroupRepository.UpdatePostContent(
      postId,
      data.content,
      data.dueDate ? new Date(data.dueDate) : undefined,
      prisma
    );

    const updatedPost = MapUpdatedPost(rawUpdated);

    logger.info({
      action: "LearningGroupService.UpdatePost",
      status: "success",
      schema: schemaName,
      groupId,
      postId,
      authorId,
      removedAttachments: validRemoveIds.length,
      addedAttachments: newFiles.length,
    });

    return updatedPost;
  }

  public static async DeletePost(
    schemaName: string,
    groupId: number,
    postId: number,
    requestingUserId: number
  ) {
    const prisma = GetTenantClient(schemaName);

    const post = await LearningGroupRepository.FindPostForDelete(postId, groupId, prisma);

    if (!post) {
      throw new NotFoundError("Post not found.");
    }

    const membership = await LearningGroupRepository.FindMembership(
      groupId,
      requestingUserId,
      prisma
    );

    const isAuthor = post.authorId === requestingUserId;
    const isOwner = membership?.role === "Owner";

    if (!isAuthor && !isOwner) {
      throw new ForbiddenError("Only the post author or a group owner can delete this post.");
    }

    if (post.attachments.length > 0) {
      await Promise.all(
        post.attachments.map((a) => deleteFromCloudinary(a.storagePath))
      );
    }

    await LearningGroupRepository.DeletePost(postId, prisma);

    logger.info({
      action: "LearningGroupService.DeletePost",
      status: "success",
      schema: schemaName,
      groupId,
      postId,
      requestingUserId,
      deletedAsOwner: isOwner && !isAuthor,
    });
  }

  public static async TogglePinPost(
    schemaName: string,
    groupId: number,
    postId: number
  ) {
    const prisma = GetTenantClient(schemaName);

    const rawPost = await LearningGroupRepository.TogglePinPost(postId, groupId, prisma);

    if (!rawPost) {
      throw new NotFoundError("Post not found.");
    }

    const post = MapTogglePinPost(rawPost);

    logger.info({
      action: "LearningGroupService.TogglePinPost",
      status: "success",
      schema: schemaName,
      groupId,
      postId,
      isPinned: post.isPinned,
    });

    return post;
  }

  public static async GetPostComments(
    schemaName: string,
    groupId: number,
    postId: number
  ) {
    const prisma = GetTenantClient(schemaName);

    const rawComments = await LearningGroupRepository.GetPostComments(postId, groupId, prisma);

    if (!rawComments) {
      throw new NotFoundError("Post not found.");
    }

    const comments = MapPostComments(rawComments);

    logger.info({
      action: "LearningGroupService.GetPostComments",
      status: "success",
      schema: schemaName,
      groupId,
      postId,
      commentCount: comments.length,
    });

    return comments;
  }

  public static async CreateComment(
    schemaName: string,
    groupId: number,
    postId: number,
    authorId: number,
    content: string
  ) {
    const prisma = GetTenantClient(schemaName);

    const post = await LearningGroupRepository.FindPostInGroup(postId, groupId, prisma);

    if (!post) {
      throw new NotFoundError("Post not found.");
    }

    const rawComment = await LearningGroupRepository.CreateComment(
      postId,
      authorId,
      content,
      prisma
    );

    const comment = MapCreatedComment(rawComment);

    logger.info({
      action: "LearningGroupService.CreateComment",
      status: "success",
      schema: schemaName,
      groupId,
      postId,
      authorId,
    });

    return comment;
  }

  public static async DeleteComment(
    schemaName: string,
    groupId: number,
    postId: number,
    commentId: number,
    requestingUserId: number
  ) {
    const prisma = GetTenantClient(schemaName);

    const comment = await LearningGroupRepository.FindCommentForDelete(
      commentId,
      postId,
      groupId,
      prisma
    );

    if (!comment) {
      throw new NotFoundError("Comment not found.");
    }

    const membership = await LearningGroupRepository.FindMembership(
      groupId,
      requestingUserId,
      prisma
    );

    const isAuthor = comment.authorId === requestingUserId;
    const isOwner = membership?.role === "Owner";

    if (!isAuthor && !isOwner) {
      throw new ForbiddenError("Only the comment author or a group owner can delete this comment.");
    }

    await LearningGroupRepository.DeleteComment(commentId, prisma);

    logger.info({
      action: "LearningGroupService.DeleteComment",
      status: "success",
      schema: schemaName,
      groupId,
      postId,
      commentId,
      requestingUserId,
      deletedAsOwner: isOwner && !isAuthor,
    });
  }
}
