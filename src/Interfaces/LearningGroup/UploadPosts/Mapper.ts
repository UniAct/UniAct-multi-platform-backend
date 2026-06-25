import { LearningGroupRepository } from "../../../Repositories/LearningGroupRepository";

type CreatePostResult = Awaited<ReturnType<typeof LearningGroupRepository.CreatePostWithAttachments>>;

export function MapCreatedPost(raw: CreatePostResult) {
  return {
    postId:     raw.id,
    postType:   raw.postType,
    content:    raw.content,
    dueDate:    raw.dueDate,
    isPinned:   raw.isPinned,
    isEdited:   raw.isEdited,
    createdAt:  raw.createdAt,
    attachments: raw.attachments.map((a) => ({
      attachmentId: a.id,
      fileName:     a.fileName,
      fileType:     a.fileType,
      url:          a.storagePath,
      fileSize:     a.fileSize ? Number(a.fileSize) : null,
    })),
  };
}