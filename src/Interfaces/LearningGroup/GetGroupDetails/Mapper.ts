import { LearningGroupRepository } from "../../../Repositories/LearningGroupRepository";

type GetGroupDetailsResult = Awaited<ReturnType<typeof LearningGroupRepository.GetGroupDetails>>;

export function MapLearningGroupDetails(
  raw: NonNullable<GetGroupDetailsResult>,
  requestingUserId: number
) {
  const myRole = raw.members.find((m) => m.userId === requestingUserId)?.role ?? null;

  return {
    groupId:           raw.id,
    groupName:         raw.groupName,
    accessCode:        myRole === "Owner" ? raw.accessCode : null,
    allowStudentPosts: raw.allowStudentPosts,
    createdAt:         raw.createdAt,
    course:            raw.course,
    semester:          raw.semester,
    memberCount:       raw.members.length,
    myRole,
  };
}