import { LearningGroupRepository } from "../../../Repositories/LearningGroupRepository";

type TogglePinPostResult = Awaited<ReturnType<typeof LearningGroupRepository.TogglePinPost>>;

export function MapTogglePinPost(raw: NonNullable<TogglePinPostResult>) {
  return {
    postId:    raw.id,
    postType:  raw.postType,
    content:   raw.content,
    isPinned:  raw.isPinned,
    isEdited:  raw.isEdited,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}