import { LearningGroupRepository } from "../../../Repositories/LearningGroupRepository";
import { IPage } from "../../Common/PaginatedList";

type GetGroupPostsResult = Awaited<ReturnType<typeof LearningGroupRepository.GetGroupPosts>>;

export interface PostDto {
  postId: number;
  postType: string;
  content: string | null;
  dueDate: Date | null;
  isPinned: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: { userId: number; firstName: string; lastName: string };
  attachments: { attachmentId: number; fileName: string; fileType: string; url: string; fileSize: number | null }[];
  commentCount: number;
}

export function MapGroupPosts(
  raw: GetGroupPostsResult,
  pageNumber: number,
  pageSize: number
): IPage<PostDto> {
  const items: PostDto[] = raw.items.map((post) => ({
    postId:       post.id,
    postType:     post.postType,
    content:      post.content,
    dueDate:      post.dueDate,
    isPinned:     post.isPinned,
    isEdited:     post.isEdited,
    createdAt:    post.createdAt,
    updatedAt:    post.updatedAt,
    author: {
      userId:    post.author.id,
      firstName: post.author.firstName,
      lastName:  post.author.lastName,
    },
    attachments: post.attachments.map((a) => ({
      attachmentId: a.id,
      fileName:     a.fileName,
      fileType:     a.fileType,
      url:          a.storagePath,
      fileSize:     a.fileSize ? Number(a.fileSize) : null,
    })),
    commentCount: post._count.comments,
  }));

  return {
    pageNumber,
    pageSize,
    totalPages: Math.ceil(raw.totalCount / pageSize),
    totalCount: raw.totalCount,
    items,
  };
}