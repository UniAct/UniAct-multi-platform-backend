import { LearningGroupRepository } from "../../../Repositories/LearningGroupRepository";

type UpdatePostResult = Awaited<ReturnType<typeof LearningGroupRepository.UpdatePostContent>>;

export function MapUpdatedPost(raw: UpdatePostResult) {
  return {
    postId:     raw.id,
    postType:   raw.postType,
    content:    raw.content,
    dueDate:    raw.dueDate,
    isPinned:   raw.isPinned,
    isEdited:   raw.isEdited,
    createdAt:  raw.createdAt,
    updatedAt:  raw.updatedAt,
    attachments: raw.attachments.map((a) => ({
      attachmentId: a.id,
      fileName:     a.fileName,
      fileType:     a.fileType,
      url:          a.storagePath,
      fileSize:     a.fileSize ? Number(a.fileSize) : null,
    })),
  };
}