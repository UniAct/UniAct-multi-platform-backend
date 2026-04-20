/*
  Warnings:

  - You are about to drop the column `course_id` on the `ScheduleSlotContext` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacher_id,course_id,classroom_id,day_of_week,start_time,end_time,semester_id]` on the table `ScheduleSlot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[semester_id,slot_id,program_id]` on the table `ScheduleSlotContext` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course_id` to the `ScheduleSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "template"."ScheduleSlotContext" DROP CONSTRAINT "ScheduleSlotContext_course_id_fkey";

-- DropIndex
DROP INDEX "template"."ScheduleSlot_teacher_id_classroom_id_day_of_week_start_time_key";

-- DropIndex
DROP INDEX "template"."ScheduleSlotContext_semester_id_slot_id_program_id_course_i_key";

-- AlterTable
ALTER TABLE "template"."ScheduleSlot" ADD COLUMN     "course_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "template"."ScheduleSlotContext" DROP COLUMN "course_id";

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_teacher_id_course_id_classroom_id_day_of_week__key" ON "template"."ScheduleSlot"("teacher_id", "course_id", "classroom_id", "day_of_week", "start_time", "end_time", "semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlotContext_semester_id_slot_id_program_id_key" ON "template"."ScheduleSlotContext"("semester_id", "slot_id", "program_id");

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
