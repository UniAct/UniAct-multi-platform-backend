-- CreateTable
CREATE TABLE "template"."TranscriptJob" (
    "id" UUID NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "faculty_id" INTEGER NOT NULL,
    "status" "template"."EnrollmentJobStatus" NOT NULL DEFAULT 'Pending',
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranscriptJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranscriptJob_semester_id_faculty_id_idx" ON "template"."TranscriptJob"("semester_id", "faculty_id");

-- CreateIndex
CREATE INDEX "TranscriptJob_status_idx" ON "template"."TranscriptJob"("status");

-- AddForeignKey
ALTER TABLE "template"."TranscriptJob" ADD CONSTRAINT "TranscriptJob_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."TranscriptJob" ADD CONSTRAINT "TranscriptJob_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "template"."Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
