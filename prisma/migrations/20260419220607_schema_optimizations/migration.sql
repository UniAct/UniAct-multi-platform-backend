/*
  Warnings:

  - You are about to drop the column `schedule_slot_id` on the `CourseRegistration` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[student_id,slot_context_Id,semester_id]` on the table `CourseRegistration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[semester_id,teacher_id,course_id,classroom_id,day_of_week,start_time,end_time]` on the table `ScheduleSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "template"."CourseRegistration_schedule_slot_id_idx";

-- DropIndex
DROP INDEX "template"."CourseRegistration_student_id_schedule_slot_id_semester_id_key";

-- DropIndex
DROP INDEX "template"."ProgramStaff_faculty_id_idx";

-- DropIndex
DROP INDEX "template"."ProgramStaff_staff_id_faculty_id_idx";

-- DropIndex
DROP INDEX "template"."ScheduleSlot_teacher_id_course_id_classroom_id_day_of_week__key";

-- DropIndex
DROP INDEX "template"."ScheduleSlot_teacher_id_semester_id_day_of_week_idx";

-- DropIndex
DROP INDEX "template"."ScheduleSlotContext_program_id_academic_level_idx";

-- AlterTable
ALTER TABLE "template"."CourseRegistration" DROP COLUMN "schedule_slot_id";

-- CreateIndex
CREATE INDEX "CourseRegistration_slot_context_Id_idx" ON "template"."CourseRegistration"("slot_context_Id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRegistration_student_id_slot_context_Id_semester_id_key" ON "template"."CourseRegistration"("student_id", "slot_context_Id", "semester_id");

-- CreateIndex
CREATE INDEX "ProgramStaff_faculty_id_staff_id_idx" ON "template"."ProgramStaff"("faculty_id", "staff_id");

-- CreateIndex
CREATE INDEX "ScheduleSlot_semester_id_day_of_week_idx" ON "template"."ScheduleSlot"("semester_id", "day_of_week");

-- CreateIndex
CREATE INDEX "ScheduleSlot_teacher_id_semester_id_idx" ON "template"."ScheduleSlot"("teacher_id", "semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_semester_id_teacher_id_course_id_classroom_id__key" ON "template"."ScheduleSlot"("semester_id", "teacher_id", "course_id", "classroom_id", "day_of_week", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "ScheduleSlotContext_slot_id_idx" ON "template"."ScheduleSlotContext"("slot_id");

-- CreateIndex
CREATE INDEX "ScheduleSlotContext_semester_id_program_id_academic_level_idx" ON "template"."ScheduleSlotContext"("semester_id", "program_id", "academic_level");
