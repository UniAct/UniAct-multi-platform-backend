import { LearningGroupRepository } from "../../../Repositories/LearningGroupRepository";

type GetGroupsForUserResult = Awaited<ReturnType<typeof LearningGroupRepository.GetGroupsForUser>>;

export function MapMyLearningGroups(raw: GetGroupsForUserResult) {
  return raw.map((membership) => ({
    groupId:           membership.group.id,
    groupName:         membership.group.groupName,
    accessCode:        membership.role === "Owner" ? membership.group.accessCode : null,
    allowStudentPosts: membership.group.allowStudentPosts,
    course: {
      id:      membership.group.course.id,
      code:    membership.group.course.code,
      name:    membership.group.course.name,
      credits: membership.group.course.credits,
    },
    myRole:   membership.role,
  }));
}