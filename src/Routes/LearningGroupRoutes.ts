import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { RequirePermission } from "../Middlewares/Authorization/RequirePermission";
import { LearningGroupController } from "../Controllers/LearningGroupController";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { RequireLearningGroupMembership } from "../Middlewares/LearningGroupMembership";
import { GroupIdParamSchema } from "../Interfaces/LearningGroup/GetGroupDetails/GetGroupDetailRequest";
import { JoinByAccessCodeSchema } from "../Interfaces/LearningGroup/AccessCode/JoinGroupRequest";
import { CreatePostSchema } from "../Interfaces/LearningGroup/UploadPosts/CreatePostRequest";
import { HandlePostAttachmentsUpload } from "../Middlewares/HandlePostAttachementUpload";
import { GetPostsQuerySchema } from "../Interfaces/LearningGroup/GetPosts/GetPostsRequest";
import { UpdatePostSchema } from "../Interfaces/LearningGroup/UpdatePost/UpdatePostRequest";
import { PostIdParamSchema } from "../Interfaces/LearningGroup/Common/GetPostId";
import { RequireLearningGroupOwner } from "../Middlewares/RequireLearningGroupOwner";
import { CreateCommentSchema } from "../Interfaces/LearningGroup/CreateComment/CreateCommentRequest";
import { CommentIdParamSchema } from "../Interfaces/LearningGroup/DeleteComment/DeleteCommentRequest";

const router = Router();

router.get(
  "/",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.read.name),
  asyncHandler(LearningGroupController.GetMyGroups)
);

// todo: cache the result of RequireLearningGroupMembership middleware
router.get(
  "/:groupId",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.read.name),
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(LearningGroupController.GetGroupDetails)
);

router.get(
  "/:groupId/members",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.read.name),
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(LearningGroupController.GetMembers)
);


router.post(
  "/join",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.join.name),
  ZodValidator({ body: JoinByAccessCodeSchema }),
  asyncHandler(LearningGroupController.JoinByAccessCode)
);

router.get(
  "/:groupId/posts",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.read.name),
  ZodValidator({ params: GroupIdParamSchema ,query: GetPostsQuerySchema }),
  RequireLearningGroupMembership,
  asyncHandler(LearningGroupController.GetPosts)
);

router.post(
  "/:groupId/posts",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.post.create.name),
  ZodValidator({ params: GroupIdParamSchema }),  
  RequireLearningGroupMembership,
  HandlePostAttachmentsUpload,
  ZodValidator({ body: CreatePostSchema }),       
  asyncHandler(LearningGroupController.CreatePost)
);

router.put(
  "/:groupId/posts/:postId",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.post.update.name),
  ZodValidator({ params: PostIdParamSchema }),
  RequireLearningGroupMembership,
  HandlePostAttachmentsUpload,
  ZodValidator({ body: UpdatePostSchema }),
  asyncHandler(LearningGroupController.UpdatePost)
);

router.delete(
  "/:groupId/posts/:postId",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.post.delete.name),
  ZodValidator({ params: PostIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(LearningGroupController.DeletePost)
);

router.patch(
  "/:groupId/posts/:postId/pin",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.post.pin.name),
  ZodValidator({ params: PostIdParamSchema }),
  RequireLearningGroupOwner,
  asyncHandler(LearningGroupController.TogglePinPost)
);

router.get(
  "/:groupId/posts/:postId/comments",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.read.name),
  ZodValidator({ params: PostIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(LearningGroupController.GetComments)
);

router.post(
  "/:groupId/posts/:postId/comments",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.comment.create.name),
  ZodValidator({ params: PostIdParamSchema, body: CreateCommentSchema }),
  RequireLearningGroupMembership,
  asyncHandler(LearningGroupController.CreateComment)
);

router.delete(
  "/:groupId/posts/:postId/comments/:commentId",
  IsAuthenticated,
  AttachAndValidateTenant,
  // RequirePermission(permissions.learningGroup.comment.delete.name),
  ZodValidator({ params: CommentIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(LearningGroupController.DeleteComment)
);

export default router;