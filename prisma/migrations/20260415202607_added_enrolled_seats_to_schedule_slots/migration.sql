-- AlterTable
ALTER TABLE "template"."Program" ALTER COLUMN "duration_years" DROP NOT NULL;

-- AlterTable
ALTER TABLE "template"."ScheduleSlot" ADD COLUMN     "enrolled_seats" SMALLINT NOT NULL DEFAULT 0;
