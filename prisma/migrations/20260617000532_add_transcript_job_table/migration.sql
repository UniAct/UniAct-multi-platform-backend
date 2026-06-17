-- CreateEnum
CREATE TYPE "template"."TranscriptJobStatus" AS ENUM ('Pending', 'Processing', 'Completed', 'Failed', 'Partial_failure');

-- CreateTable
CREATE TABLE "template"."TranscriptJob" (
    "id" UUID NOT NULL,
    "faculty_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "status" "template"."TranscriptJobStatus" NOT NULL DEFAULT 'Pending',
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranscriptJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranscriptJob_semester_id_idx" ON "template"."TranscriptJob"("semester_id");

-- CreateIndex
CREATE INDEX "TranscriptJob_status_idx" ON "template"."TranscriptJob"("status");

-- AddForeignKey
ALTER TABLE "template"."TranscriptJob" ADD CONSTRAINT "TranscriptJob_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
