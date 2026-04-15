/*
  Warnings:

  - You are about to drop the column `is_available` on the `Classroom` table. All the data in the column will be lost.
  - The primary key for the `ProgramCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `program_id` on the `ProgramCourse` table. All the data in the column will be lost.
  - You are about to drop the column `time_range` on the `ScheduleSlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[program_level_id,course_id]` on the table `ProgramCourse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duration_years` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programId` to the `ProgramCourse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program_level_id` to the `ProgramCourse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "template"."ProgramCourse" DROP CONSTRAINT "ProgramCourse_program_id_fkey";

-- DropIndex
DROP INDEX "template"."Classroom_is_available_idx";

-- AlterTable
ALTER TABLE "template"."Classroom" DROP COLUMN "is_available";

-- AlterTable
ALTER TABLE "template"."Program" ADD COLUMN     "duration_years" INTEGER NOT NULL,
ADD COLUMN     "staffUserId" INTEGER;

-- AlterTable
ALTER TABLE "template"."ProgramCourse" DROP CONSTRAINT "ProgramCourse_pkey",
DROP COLUMN "program_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "programId" INTEGER NOT NULL,
ADD COLUMN     "program_level_id" INTEGER NOT NULL,
ADD CONSTRAINT "ProgramCourse_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "template"."ScheduleSlot" DROP COLUMN "time_range";

-- CreateTable
CREATE TABLE "template"."ProgramStaff" (
    "id" SERIAL NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "faculty_id" INTEGER NOT NULL,

    CONSTRAINT "ProgramStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgramStaff_faculty_id_idx" ON "template"."ProgramStaff"("faculty_id");

-- CreateIndex
CREATE INDEX "ProgramStaff_staff_id_faculty_id_idx" ON "template"."ProgramStaff"("staff_id", "faculty_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramStaff_staff_id_program_id_key" ON "template"."ProgramStaff"("staff_id", "program_id");

-- CreateIndex
CREATE INDEX "Classroom_underMaintenance_idx" ON "template"."Classroom"("underMaintenance");

-- CreateIndex
CREATE INDEX "ProgramCourse_programId_idx" ON "template"."ProgramCourse"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCourse_program_level_id_course_id_key" ON "template"."ProgramCourse"("program_level_id", "course_id");

-- AddForeignKey
ALTER TABLE "template"."ProgramStaff" ADD CONSTRAINT "ProgramStaff_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "template"."Staff"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ProgramStaff" ADD CONSTRAINT "ProgramStaff_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ProgramStaff" ADD CONSTRAINT "ProgramStaff_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "template"."Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ProgramCourse" ADD CONSTRAINT "ProgramCourse_programId_fkey" FOREIGN KEY ("programId") REFERENCES "template"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ProgramCourse" ADD CONSTRAINT "ProgramCourse_program_level_id_fkey" FOREIGN KEY ("program_level_id") REFERENCES "template"."ProgramLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
