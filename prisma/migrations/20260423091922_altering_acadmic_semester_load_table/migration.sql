/*
  Warnings:

  - You are about to drop the column `semester_id` on the `AcademicLoadSemester` table. All the data in the column will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[program_id,semester_number,program_level_id]` on the table `AcademicLoadSemester` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `semester_number` to the `AcademicLoadSemester` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "template"."AcademicLoadSemester" DROP CONSTRAINT "AcademicLoadSemester_semester_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."RefreshToken" DROP CONSTRAINT "RefreshToken_user_id_fkey";

-- DropIndex
DROP INDEX "template"."AcademicLoadSemester_program_id_semester_id_program_level_i_key";

-- DropIndex
DROP INDEX "template"."AcademicLoadSemester_semester_id_idx";

-- AlterTable
ALTER TABLE "template"."AcademicLoadSemester" DROP COLUMN "semester_id",
ADD COLUMN     "semester_number" SMALLINT NOT NULL;

-- DropTable
DROP TABLE "template"."RefreshToken";

-- CreateIndex
CREATE INDEX "AcademicLoadSemester_semester_number_idx" ON "template"."AcademicLoadSemester"("semester_number");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicLoadSemester_program_id_semester_number_program_lev_key" ON "template"."AcademicLoadSemester"("program_id", "semester_number", "program_level_id");
