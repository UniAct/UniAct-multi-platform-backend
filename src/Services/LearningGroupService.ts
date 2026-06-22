import { LearningGroupRole, Prisma } from "@prisma/client";

export class LearningGroupService {

    public static async ensureLearningGroupExistsWithOwner(
      courseId: number,
      semesterId: number,
      teacherId: number,
      tx: Prisma.TransactionClient
   ) {
      const existingGroup = await this.checkLearningGroupExistance(courseId, semesterId, teacherId, tx);

      if (!existingGroup) {
         const course = await tx.course.findUnique({ where: { id: courseId }, select: { name: true } });
         await this.CreateLearningGroupWithOwner(
            courseId,
            semesterId,
            course?.name || 'Course',
            teacherId,
            LearningGroupRole.Owner,
            tx
         );
      } else if (existingGroup.members.length === 0) {
         await this.addLearningGroupMember(existingGroup.id, teacherId, LearningGroupRole.Owner, tx);
      }
   }

    public static async handleGroupOrMemberCleanup(
      courseId: number,
      semesterId: number,
      teacherId: number,
      tx: Prisma.TransactionClient
   ) {
      // Fix: Check globally across the whole semester instead of isolating by program context
      const remainingGlobalSlotsForCourse = await tx.scheduleSlot.count({
         where: { courseId, semesterId }
      });

      if (remainingGlobalSlotsForCourse === 0) {
         // True total orphan: Purge the group cleanly out of the database
         await tx.learningGroup.deleteMany({
            where: { courseId, semesterId }
         });
         return;
      }

      // If the group is still preserved globally, check if this specific teacher is completely done with it
      const remainingSlotsForTeacher = await tx.scheduleSlot.count({
         where: { courseId, semesterId, teacherId }
      });

      if (remainingSlotsForTeacher === 0) {
         // Evict them safely without risking crashing the interactive transaction block
         await tx.learningGroupMember.deleteMany({
            where: {
               userId: teacherId,
               group: { courseId, semesterId }
            }
         });
      }
   }
   

    public static async addLearningGroupMember(groupId: number, userId: number, role: LearningGroupRole, tx: Prisma.TransactionClient) {
      await tx.learningGroupMember.create({
         data: { learningGroupId: groupId, userId, role }
      });
   }


    public static async checkLearningGroupExistance(
      courseId: number,
      semesterId: number,
      teacherId: number,
      tx: Prisma.TransactionClient
   ) {
      const existingGroup = await tx.learningGroup.findUnique({
         where: { courseId_semesterId: { courseId, semesterId } },
         select: { id: true, members: { where: { userId: teacherId }, select: { userId: true } } }
      });
      return existingGroup;
   }


    public static async CreateLearningGroupWithOwner(
      courseId: number,
      semesterId: number,
      courseName: string,
      memberId: number,
      role: LearningGroupRole, 
      tx: Prisma.TransactionClient
   ) {

      const accessCode = this.generateAccessCode();

      await tx.learningGroup.create({
         data: {
            courseId,
            semesterId,
            groupName: `${courseName} Group`,
            accessCode,
            members: {
               //add the teacher as an owner of the group
               create: { userId: memberId, role }
            }
         }
      });
   }


    public static generateAccessCode(length = 6): string {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids confusing chars
      let code = "";

      for (let i = 0; i < length; i++) {
         code += chars[Math.floor(Math.random() * chars.length)];
      }

      return code;

   }
}