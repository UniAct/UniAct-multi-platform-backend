/*
  Warnings:

  - You are about to drop the column `semester_id` on the `Fee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[program_level_id,semester_number,fee_type]` on the table `Fee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `semester_number` to the `Fee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "template"."Fee" DROP CONSTRAINT "Fee_semester_id_fkey";

-- DropIndex
DROP INDEX "template"."Fee_program_level_id_semester_id_fee_type_key";

-- DropIndex
DROP INDEX "template"."Fee_semester_id_idx";

ALTER TABLE "template"."Fee"
DROP COLUMN "semester_id",
ADD COLUMN "semester_number" SMALLINT NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Fee_semester_number_idx" ON "template"."Fee"("semester_number");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Fee_program_level_id_semester_number_fee_type_key" ON "template"."Fee"("program_level_id", "semester_number", "fee_type");
