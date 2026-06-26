import { LearningGroupRepository } from "../../../Repositories/LearningGroupRepository";

type GetPostCommentsResult = Awaited<ReturnType<typeof LearningGroupRepository.GetPostComments>>;

export function MapPostComments(raw: NonNullable<GetPostCommentsResult>) {
  return raw.map((comment) => ({
    commentId: comment.id,
    content:   comment.content,
    isEdited:  comment.isEdited,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: {
      userId:    comment.author.id,
      firstName: comment.author.firstName,
      lastName:  comment.author.lastName,
    },
  }));
}