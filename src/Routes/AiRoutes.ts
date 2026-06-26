import { Router } from "express";
import IsAuthenticated from "../Middlewares/AuthMiddleware";
import { AttachAndValidateTenant } from "../Middlewares/attatchAndValidateTenant";
import { RequireLearningGroupMembership } from "../Middlewares/LearningGroupMembership";
import { ZodValidator } from "../Middlewares/ZodValidation";
import { GroupIdParamSchema } from "../Interfaces/LearningGroup/GetGroupDetails/GetGroupDetailRequest";
import { asyncHandler } from "../Middlewares/ErrorHandler";
import { AiController } from "../Controllers/AiController";

const router = Router();

router.use(IsAuthenticated, AttachAndValidateTenant);

router.get("/health", asyncHandler(AiController.Health));

router.get(
  "/groups/:groupId/files",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.GetGroupFiles)
);

router.get(
  "/groups/:groupId/chapters",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.GetGroupChapters)
);

router.get(
  "/groups/:groupId/index",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.GetIndexInfo)
);

router.post(
  "/groups/:groupId/sync",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.SyncGroupMaterials)
);

router.get(
  "/groups/:groupId/sessions",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.ListSessions)
);

router.post(
  "/groups/:groupId/sessions",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.CreateSession)
);

router.get(
  "/sessions/:sessionId/history",
  asyncHandler(AiController.GetSessionHistory)
);

router.post(
  "/groups/:groupId/chat",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.Chat)
);

router.post(
  "/groups/:groupId/search",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.Search)
);

router.post(
  "/groups/:groupId/summarize",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.Summarize)
);

router.post(
  "/groups/:groupId/exam",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.Exam)
);

router.post(
  "/groups/:groupId/mindmap",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.MindMap)
);

router.get(
  "/groups/:groupId/study/files",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.ListStudyFiles)
);

router.get(
  "/groups/:groupId/study/files/:fileId",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.GetStudyData)
);

router.post(
  "/groups/:groupId/study/files/:fileId",
  ZodValidator({ params: GroupIdParamSchema }),
  RequireLearningGroupMembership,
  asyncHandler(AiController.SaveStudyData)
);

export default router;
