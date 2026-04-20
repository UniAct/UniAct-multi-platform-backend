/*
  Warnings:

  - You are about to drop the column `academic_level` on the `ScheduleSlot` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `ScheduleSlot` table. All the data in the column will be lost.
  - You are about to drop the column `learning_group_id` on the `ScheduleSlot` table. All the data in the column will be lost.
  - You are about to drop the column `program_id` on the `ScheduleSlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacher_id,classroom_id,day_of_week,start_time,end_time,semester_id]` on the table `ScheduleSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "template"."CourseRegistration" DROP CONSTRAINT "CourseRegistration_schedule_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ScheduleSlot" DROP CONSTRAINT "ScheduleSlot_course_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ScheduleSlot" DROP CONSTRAINT "ScheduleSlot_learning_group_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ScheduleSlot" DROP CONSTRAINT "ScheduleSlot_program_id_fkey";

-- DropIndex
DROP INDEX "template"."ScheduleSlot_program_id_semester_id_academic_level_idx";

-- DropIndex
DROP INDEX "template"."ScheduleSlot_semester_id_course_id_idx";

-- AlterTable
ALTER TABLE "template"."CourseRegistration" ADD COLUMN     "slot_context_Id" INTEGER;

-- AlterTable
ALTER TABLE "template"."ScheduleSlot" DROP COLUMN "academic_level",
DROP COLUMN "course_id",
DROP COLUMN "learning_group_id",
DROP COLUMN "program_id";

-- CreateTable
CREATE TABLE "template"."ScheduleSlotContext" (
    "id" SERIAL NOT NULL,
    "slot_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "academic_level" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "learning_group_id" INTEGER,

    CONSTRAINT "ScheduleSlotContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleSlotContext_program_id_academic_level_idx" ON "template"."ScheduleSlotContext"("program_id", "academic_level");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlotContext_semester_id_slot_id_program_id_course_i_key" ON "template"."ScheduleSlotContext"("semester_id", "slot_id", "program_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_teacher_id_classroom_id_day_of_week_start_time_key" ON "template"."ScheduleSlot"("teacher_id", "classroom_id", "day_of_week", "start_time", "end_time", "semester_id");

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlotContext" ADD CONSTRAINT "ScheduleSlotContext_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "template"."ScheduleSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlotContext" ADD CONSTRAINT "ScheduleSlotContext_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlotContext" ADD CONSTRAINT "ScheduleSlotContext_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlotContext" ADD CONSTRAINT "ScheduleSlotContext_learning_group_id_fkey" FOREIGN KEY ("learning_group_id") REFERENCES "template"."LearningGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CourseRegistration" ADD CONSTRAINT "CourseRegistration_slot_context_Id_fkey" FOREIGN KEY ("slot_context_Id") REFERENCES "template"."ScheduleSlotContext"("id") ON DELETE SET NULL ON UPDATE CASCADE;
