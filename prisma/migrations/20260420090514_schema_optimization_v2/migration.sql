/*
  Warnings:

  - A unique constraint covering the columns `[semester_id,teacher_id,classroom_id,day_of_week,start_time,end_time]` on the table `ScheduleSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "template"."ScheduleSlot_semester_id_teacher_id_course_id_classroom_id__key";

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_semester_id_teacher_id_classroom_id_day_of_wee_key" ON "template"."ScheduleSlot"("semester_id", "teacher_id", "classroom_id", "day_of_week", "start_time", "end_time");
