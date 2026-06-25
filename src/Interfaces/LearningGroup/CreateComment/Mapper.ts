import { LearningGroupRepository } from "../../../Repositories/LearningGroupRepository";

type CreateCommentResult = Awaited<ReturnType<typeof LearningGroupRepository.CreateComment>>;

export function MapCreatedComment(raw: CreateCommentResult) {
  return {
    commentId: raw.id,
    content:   raw.content,
    isEdited:  raw.isEdited,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    author: {
      userId:    raw.author.id,
      firstName: raw.author.firstName,
      lastName:  raw.author.lastName,
    },
  };
}