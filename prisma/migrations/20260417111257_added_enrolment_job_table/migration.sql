-- CreateEnum
CREATE TYPE "template"."EnrollmentJobStatus" AS ENUM ('Pending', 'Processing', 'Done');

-- CreateTable
CREATE TABLE "template"."EnrollmentJob" (
    "id" UUID NOT NULL,
    "student_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "status" "template"."EnrollmentJobStatus" NOT NULL DEFAULT 'Pending',
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnrollmentJob_student_id_semester_id_idx" ON "template"."EnrollmentJob"("student_id", "semester_id");

-- CreateIndex
CREATE INDEX "EnrollmentJob_status_idx" ON "template"."EnrollmentJob"("status");

-- AddForeignKey
ALTER TABLE "template"."EnrollmentJob" ADD CONSTRAINT "EnrollmentJob_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "template"."Student"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."EnrollmentJob" ADD CONSTRAINT "EnrollmentJob_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
