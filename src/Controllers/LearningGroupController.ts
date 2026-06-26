import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import JSendStatus from "../Enums/Jsend";
import { LearningGroupService } from "../Services/LearningGroupService";
import { JoinByAccessCodeDto } from "../Interfaces/LearningGroup/AccessCode/JoinGroupRequest";
import { CreatePostDto } from "../Interfaces/LearningGroup/UploadPosts/CreatePostRequest";
import { GetPostsQueryDto } from "../Interfaces/LearningGroup/GetPosts/GetPostsRequest";
import { UpdatePostDto } from "../Interfaces/LearningGroup/UpdatePost/UpdatePostRequest";
import { CreateCommentDto } from "../Interfaces/LearningGroup/CreateComment/CreateCommentRequest";
import { BadRequestError } from "../Types/Errors";

export class LearningGroupController{
  static async GetMyGroups(req: Request, res: Response) {
    const userId = Number(req.user?.id);
    const semesterId = req.query.semesterId === undefined
      ? Number(req.user?.semester?.id)
      : Number(req.query.semesterId);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestError("A valid authenticated user is required.");
    }

    const groups = await LearningGroupService.GetMyGroups(
      req.schema_name!,
      userId,
      Number.isInteger(semesterId) && semesterId > 0 ? semesterId : undefined
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: groups,
      message: "Learning groups retrieved successfully.",
    });
  }

  static async GetGroupDetails(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number;
    const userId = Number(req.user?.id);

    const group = await LearningGroupService.GetGroupDetails(
      req.schema_name!,
      groupId,
      userId
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: group,
      message: "Learning group details retrieved successfully.",
    });
  }

  static async GetMembers(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number; 

    const members = await LearningGroupService.GetGroupMembers(
      req.schema_name!,
      groupId
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: members,
      message: "Learning group members retrieved successfully.",
    });
  }

  static async JoinByAccessCode(req: Request, res: Response) {
    const { accessCode } = req.body as JoinByAccessCodeDto;
    const userId = Number(req.user?.id);

    const result = await LearningGroupService.JoinByAccessCode(
      req.schema_name!,
      userId,
      accessCode
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: result,
      message: `You have joined ${result.groupName} successfully.`,
    });
  }

  static async CreatePost(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number;
    const authorId = Number(req.user?.id);
    const data = req.body as CreatePostDto;
    const files = (req.files as Express.Multer.File[]) ?? [];

    const post = await LearningGroupService.CreatePost(
      req.schema_name!,
      groupId,
      authorId,
      data,
      files
    );

    res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data: post,
      message: "Post created successfully.",
    });
  }

  static async GetPosts(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number;
    const query = req.query as unknown as GetPostsQueryDto;

    const page = await LearningGroupService.GetGroupPosts(
      req.schema_name!,
      groupId,
      query
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: page,
      message: "Posts retrieved successfully.",

    });
  }

  static async UpdatePost(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number;
    const postId = req.params.postId as unknown as number;
    const authorId = Number(req.user?.id);
    const data = req.body as UpdatePostDto;
    const newFiles = (req.files as Express.Multer.File[]) ?? [];

    const post = await LearningGroupService.UpdatePost(
      req.schema_name!,
      groupId,
      postId,
      authorId,
      data,
      newFiles
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: post,
      message: "Post updated successfully.",
    });
  }

  static async DeletePost(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number;
    const postId = req.params.postId as unknown as number;
    const userId = Number(req.user?.id);

    await LearningGroupService.DeletePost(
      req.schema_name!,
      groupId,
      postId,
      userId
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: null,
      message: "Post deleted successfully.",
    });
  }

  static async TogglePinPost(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number;
    const postId = req.params.postId as unknown as number;

    const post = await LearningGroupService.TogglePinPost(
      req.schema_name!,
      groupId,
      postId
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: post,
      message: post.isPinned ? "Post pinned successfully." : "Post unpinned successfully.",
    });
  }

  static async GetComments(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number;
    const postId = req.params.postId as unknown as number;

    const comments = await LearningGroupService.GetPostComments(
      req.schema_name!,
      groupId,
      postId
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: comments,
      message: "Comments retrieved successfully.",
    });
  }

  static async CreateComment(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number;
    const postId = req.params.postId as unknown as number;
    const authorId = Number(req.user?.id);
    const { content } = req.body as CreateCommentDto;

    const comment = await LearningGroupService.CreateComment(
      req.schema_name!,
      groupId,
      postId,
      authorId,
      content
    );

    res.status(StatusCodes.CREATED).json({
      status: JSendStatus.SUCCESS,
      data: comment,
      message: "Comment added successfully.",
    });
  }

  static async DeleteComment(req: Request, res: Response) {
    const groupId = req.params.groupId as unknown as number;
    const postId = req.params.postId as unknown as number;
    const commentId = req.params.commentId as unknown as number;
    const userId = Number(req.user?.id);

    await LearningGroupService.DeleteComment(
      req.schema_name!,
      groupId,
      postId,
      commentId,
      userId
    );

    res.status(StatusCodes.OK).json({
      status: JSendStatus.SUCCESS,
      data: null,
      message: "Comment deleted successfully.",
    });
  }
}
