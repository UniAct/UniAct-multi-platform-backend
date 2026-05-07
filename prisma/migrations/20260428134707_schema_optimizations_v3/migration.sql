/*
  Warnings:

  - Changed the type of `grade_letter` on the `ProgramTranscriptDefinition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `allowedCapacity` to the `ScheduleSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "template"."ScheduleSlot" DROP CONSTRAINT "ScheduleSlot_course_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ScheduleSlot" DROP CONSTRAINT "ScheduleSlot_semester_id_fkey";

-- DropIndex
DROP INDEX "template"."AcademicLoadSemester_program_id_idx";

-- DropIndex
DROP INDEX "template"."Course_code_idx";

-- DropIndex
DROP INDEX "template"."CoursePrerequisite_prerequisite_id_idx";

-- DropIndex
DROP INDEX "template"."Fee_program_level_id_idx";

-- AlterTable
ALTER TABLE "template"."ProgramTranscriptDefinition" DROP COLUMN "grade_letter",
ADD COLUMN     "grade_letter" "template"."GradeEnum" NOT NULL;

-- AlterTable
ALTER TABLE "template"."ScheduleSlot" ADD COLUMN     "allowedCapacity" SMALLINT NOT NULL;

-- CreateIndex
CREATE INDEX "Course_name_idx" ON "template"."Course"("name");

-- CreateIndex
CREATE INDEX "Course_code_name_idx" ON "template"."Course"("code", "name");

-- CreateIndex
CREATE INDEX "CoursePrerequisite_prerequisite_id_course_id_idx" ON "template"."CoursePrerequisite"("prerequisite_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramTranscriptDefinition_program_id_grade_letter_key" ON "template"."ProgramTranscriptDefinition"("program_id", "grade_letter");

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
