/*
  Warnings:

  - You are about to drop the column `staffUserId` on the `Program` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Program` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "template"."Program" DROP COLUMN "staffUserId";

-- CreateIndex
CREATE UNIQUE INDEX "Program_name_key" ON "template"."Program"("name");
