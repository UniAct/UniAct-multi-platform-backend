/*
  Warnings:

  - You are about to drop the column `userId` on the `LearningGroup` table. All the data in the column will be lost.
  - The primary key for the `LearningGroupMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `LearningGroupMember` table. All the data in the column will be lost.
  - You are about to drop the column `learningGroupMemberId` on the `LearningGroupPost` table. All the data in the column will be lost.
  - You are about to drop the column `learning_group_id` on the `ScheduleSlotContext` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[course_id,semester_id]` on the table `LearningGroup` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course_id` to the `LearningGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester_id` to the `LearningGroup` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "template"."AnnouncementType" AS ENUM ('ANNOUNCEMENT', 'EVENT');

-- CreateEnum
CREATE TYPE "template"."AnnouncementAudience" AS ENUM ('ALL', 'STUDENTS', 'STAFF', 'FACULTY');

-- CreateEnum
CREATE TYPE "template"."AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterEnum
ALTER TYPE "template"."StorageProvider" ADD VALUE 'Cloudinary';

-- DropForeignKey
ALTER TABLE "template"."LearningGroup" DROP CONSTRAINT "LearningGroup_userId_fkey";

-- DropForeignKey
ALTER TABLE "template"."LearningGroupPost" DROP CONSTRAINT "LearningGroupPost_learningGroupMemberId_fkey";

-- DropForeignKey
ALTER TABLE "template"."LearningGroupPost" DROP CONSTRAINT "LearningGroupPost_learning_group_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ScheduleSlotContext" DROP CONSTRAINT "ScheduleSlotContext_learning_group_id_fkey";

-- DropIndex
DROP INDEX "template"."LearningGroupMember_learning_group_id_idx";

-- DropIndex
DROP INDEX "template"."LearningGroupMember_learning_group_id_user_id_key";

-- DropIndex
DROP INDEX "template"."LearningGroupPost_learning_group_id_idx";

-- DropIndex
DROP INDEX "template"."LearningGroupPostComment_created_at_idx";

-- AlterTable
ALTER TABLE "template"."LearningGroup" DROP COLUMN "userId",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD COLUMN     "semester_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "template"."LearningGroupMember" DROP CONSTRAINT "LearningGroupMember_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "LearningGroupMember_pkey" PRIMARY KEY ("learning_group_id", "user_id");

-- AlterTable
ALTER TABLE "template"."LearningGroupPost" DROP COLUMN "learningGroupMemberId";

-- AlterTable
ALTER TABLE "template"."LearningGroupPostComment" ADD COLUMN     "is_edited" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "template"."ScheduleSlotContext" DROP COLUMN "learning_group_id";

-- CreateTable
CREATE TABLE "template"."Announcement" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "template"."AnnouncementType" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "audience" "template"."AnnouncementAudience" NOT NULL DEFAULT 'ALL',
    "status" "template"."AnnouncementStatus" NOT NULL DEFAULT 'PUBLISHED',
    "event_date" TIMESTAMP(3),
    "event_location" VARCHAR(300),
    "author_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_type_idx" ON "template"."Announcement"("type");

-- CreateIndex
CREATE INDEX "Announcement_status_idx" ON "template"."Announcement"("status");

-- CreateIndex
CREATE INDEX "Announcement_created_at_idx" ON "template"."Announcement"("created_at" DESC);

-- CreateIndex
CREATE INDEX "LearningGroup_semester_id_idx" ON "template"."LearningGroup"("semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "LearningGroup_course_id_semester_id_key" ON "template"."LearningGroup"("course_id", "semester_id");

-- CreateIndex
CREATE INDEX "LearningGroupPost_learning_group_id_post_type_idx" ON "template"."LearningGroupPost"("learning_group_id", "post_type");

-- AddForeignKey
ALTER TABLE "template"."Announcement" ADD CONSTRAINT "Announcement_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "template"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroup" ADD CONSTRAINT "LearningGroup_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroup" ADD CONSTRAINT "LearningGroup_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroupPost" ADD CONSTRAINT "LearningGroupPost_learning_group_id_fkey" FOREIGN KEY ("learning_group_id") REFERENCES "template"."LearningGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
