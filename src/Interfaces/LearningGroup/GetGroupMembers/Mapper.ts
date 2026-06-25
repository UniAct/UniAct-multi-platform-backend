import { LearningGroupRepository } from "../../../Repositories/LearningGroupRepository";

type GetGroupMembersResult = Awaited<ReturnType<typeof LearningGroupRepository.GetGroupMembers>>;

export function MapLearningGroupMembers(raw: GetGroupMembersResult) {
  return raw.map((member) => ({
    userId:    member.user.id,
    firstName: member.user.firstName,
    lastName:  member.user.lastName,
    email:     member.user.email,
    role:      member.role,
    joinedAt:  member.joinedAt,
  }));
}