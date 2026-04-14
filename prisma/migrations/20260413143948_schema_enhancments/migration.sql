
-- CreateEnum
CREATE TYPE "template"."SlotType" AS ENUM ('Lecture', 'Lab', 'Tutorial');

-- CreateEnum
CREATE TYPE "template"."LearningGroupRole" AS ENUM ('Owner', 'Member');

-- AlterEnum
BEGIN;
CREATE TYPE "template"."ClassroomType_new" AS ENUM ('Hall', 'Lab', 'Auditorium', 'Other');
ALTER TABLE "template"."Classroom" ALTER COLUMN "type" TYPE "template"."ClassroomType_new" USING ("type"::text::"template"."ClassroomType_new");
ALTER TYPE "template"."ClassroomType" RENAME TO "ClassroomType_old";
ALTER TYPE "template"."ClassroomType_new" RENAME TO "ClassroomType";
DROP TYPE "template"."ClassroomType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "template"."AttendanceSession" DROP CONSTRAINT "AttendanceSession_class_session_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ClassSession" DROP CONSTRAINT "ClassSession_classroom_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ClassSession" DROP CONSTRAINT "ClassSession_course_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ClassSession" DROP CONSTRAINT "ClassSession_program_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ClassSession" DROP CONSTRAINT "ClassSession_room_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ClassSession" DROP CONSTRAINT "ClassSession_semester_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."ClassSession" DROP CONSTRAINT "ClassSession_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."CourseAssessment" DROP CONSTRAINT "CourseAssessment_class_session_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."CourseRegistration" DROP CONSTRAINT "CourseRegistration_session_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."Room" DROP CONSTRAINT "Room_created_by_fkey";

-- DropForeignKey
ALTER TABLE "template"."RoomMember" DROP CONSTRAINT "RoomMember_room_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."RoomMember" DROP CONSTRAINT "RoomMember_user_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."RoomPost" DROP CONSTRAINT "RoomPost_author_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."RoomPost" DROP CONSTRAINT "RoomPost_room_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."RoomPostAttachment" DROP CONSTRAINT "RoomPostAttachment_post_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."RoomPostComment" DROP CONSTRAINT "RoomPostComment_author_id_fkey";

-- DropForeignKey
ALTER TABLE "template"."RoomPostComment" DROP CONSTRAINT "RoomPostComment_post_id_fkey";

-- DropIndex
DROP INDEX "template"."AttendanceSession_class_session_id_idx";

-- DropIndex
DROP INDEX "template"."AttendanceSession_faculty_member_id_idx";

-- DropIndex
DROP INDEX "template"."AttendanceSession_is_active_idx";

-- DropIndex
DROP INDEX "template"."Classroom_room_number_building_key";

-- DropIndex
DROP INDEX "template"."CourseAssessment_class_session_id_idx";

-- DropIndex
DROP INDEX "template"."CourseRegistration_session_id_idx";

-- DropIndex
DROP INDEX "template"."CourseRegistration_student_id_session_id_semester_id_key";

-- AlterTable
ALTER TABLE "template"."AttendanceSession" DROP COLUMN "class_session_id",
DROP COLUMN "is_active",
ADD COLUMN     "schedule_slot_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "template"."Classroom" DROP COLUMN "room_number",
ADD COLUMN     "classroom_number" VARCHAR(50) NOT NULL,
ADD COLUMN     "underMaintenance" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "template"."CourseAssessment" DROP COLUMN "class_session_id",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD COLUMN     "semester_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "template"."CourseRegistration" DROP COLUMN "session_id",
ADD COLUMN     "schedule_slot_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "template"."Program" DROP COLUMN "block_reason";

-- AlterTable
ALTER TABLE "template"."User" ADD COLUMN     "blockReason" "template"."BlockReasonType";

-- DropTable
DROP TABLE "template"."ClassSession";

-- DropTable
DROP TABLE "template"."Room";

-- DropTable
DROP TABLE "template"."RoomMember";

-- DropTable
DROP TABLE "template"."RoomPost";

-- DropTable
DROP TABLE "template"."RoomPostAttachment";

-- DropTable
DROP TABLE "template"."RoomPostComment";

-- DropEnum
DROP TYPE "template"."RoomRole";

-- CreateTable
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" SERIAL NOT NULL,
    "super_admin_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."LearningGroup" (
    "id" SERIAL NOT NULL,
    "group_name" VARCHAR(255) NOT NULL,
    "access_code" VARCHAR(50),
    "allow_student_posts" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "LearningGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."ScheduleSlot" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "classroom_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "learning_group_id" INTEGER,
    "academic_level" INTEGER NOT NULL,
    "day_of_week" "template"."DayOfWeek" NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "type" "template"."SlotType" NOT NULL DEFAULT 'Lecture',

    CONSTRAINT "ScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."LearningGroupMember" (
    "id" SERIAL NOT NULL,
    "learning_group_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "template"."LearningGroupRole" NOT NULL DEFAULT 'Member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."LearningGroupPost" (
    "id" SERIAL NOT NULL,
    "learning_group_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT,
    "post_type" "template"."PostType" NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "learningGroupMemberId" INTEGER,

    CONSTRAINT "LearningGroupPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."LearningGroupPostAttachment" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "storage_provider" "template"."StorageProvider" NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "file_size" BIGINT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningGroupPostAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template"."LearningGroupPostComment" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningGroupPostComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RefreshToken_expires_at_idx" ON "RefreshToken"("expires_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RefreshToken_super_admin_id_idx" ON "RefreshToken"("super_admin_id");

-- CreateIndex
CREATE INDEX "ScheduleSlot_classroom_id_day_of_week_idx" ON "template"."ScheduleSlot"("classroom_id", "day_of_week");

-- CreateIndex
CREATE INDEX "ScheduleSlot_program_id_semester_id_academic_level_idx" ON "template"."ScheduleSlot"("program_id", "semester_id", "academic_level");

-- CreateIndex
CREATE INDEX "ScheduleSlot_semester_id_course_id_idx" ON "template"."ScheduleSlot"("semester_id", "course_id");

-- CreateIndex
CREATE INDEX "ScheduleSlot_teacher_id_semester_id_day_of_week_idx" ON "template"."ScheduleSlot"("teacher_id", "semester_id", "day_of_week");

-- CreateIndex
CREATE INDEX "LearningGroupMember_learning_group_id_idx" ON "template"."LearningGroupMember"("learning_group_id");

-- CreateIndex
CREATE INDEX "LearningGroupMember_user_id_idx" ON "template"."LearningGroupMember"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "LearningGroupMember_learning_group_id_user_id_key" ON "template"."LearningGroupMember"("learning_group_id", "user_id");

-- CreateIndex
CREATE INDEX "LearningGroupPost_learning_group_id_idx" ON "template"."LearningGroupPost"("learning_group_id");

-- CreateIndex
CREATE INDEX "LearningGroupPost_author_id_idx" ON "template"."LearningGroupPost"("author_id");

-- CreateIndex
CREATE INDEX "LearningGroupPostAttachment_post_id_idx" ON "template"."LearningGroupPostAttachment"("post_id");

-- CreateIndex
CREATE INDEX "LearningGroupPostComment_post_id_idx" ON "template"."LearningGroupPostComment"("post_id");

-- CreateIndex
CREATE INDEX "LearningGroupPostComment_author_id_idx" ON "template"."LearningGroupPostComment"("author_id");

-- CreateIndex
CREATE INDEX "LearningGroupPostComment_created_at_idx" ON "template"."LearningGroupPostComment"("created_at");

-- CreateIndex
CREATE INDEX "AttendanceSession_schedule_slot_id_session_date_idx" ON "template"."AttendanceSession"("schedule_slot_id", "session_date");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_classroom_number_building_key" ON "template"."Classroom"("classroom_number", "building");

-- CreateIndex
CREATE INDEX "CourseAssessment_course_id_semester_id_idx" ON "template"."CourseAssessment"("course_id", "semester_id");

-- CreateIndex
CREATE INDEX "CourseRegistration_schedule_slot_id_idx" ON "template"."CourseRegistration"("schedule_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseRegistration_student_id_schedule_slot_id_semester_id_key" ON "template"."CourseRegistration"("student_id", "schedule_slot_id", "semester_id");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_super_admin_id_fkey" FOREIGN KEY ("super_admin_id") REFERENCES "SuperAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroup" ADD CONSTRAINT "LearningGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "template"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "template"."Staff"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "template"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "template"."Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_learning_group_id_fkey" FOREIGN KEY ("learning_group_id") REFERENCES "template"."LearningGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CourseAssessment" ADD CONSTRAINT "CourseAssessment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "template"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CourseAssessment" ADD CONSTRAINT "CourseAssessment_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "template"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."CourseRegistration" ADD CONSTRAINT "CourseRegistration_schedule_slot_id_fkey" FOREIGN KEY ("schedule_slot_id") REFERENCES "template"."ScheduleSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."AttendanceSession" ADD CONSTRAINT "AttendanceSession_schedule_slot_id_fkey" FOREIGN KEY ("schedule_slot_id") REFERENCES "template"."ScheduleSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroupMember" ADD CONSTRAINT "LearningGroupMember_learning_group_id_fkey" FOREIGN KEY ("learning_group_id") REFERENCES "template"."LearningGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroupMember" ADD CONSTRAINT "LearningGroupMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "template"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroupPost" ADD CONSTRAINT "LearningGroupPost_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "template"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroupPost" ADD CONSTRAINT "LearningGroupPost_learning_group_id_fkey" FOREIGN KEY ("learning_group_id") REFERENCES "template"."LearningGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroupPost" ADD CONSTRAINT "LearningGroupPost_learningGroupMemberId_fkey" FOREIGN KEY ("learningGroupMemberId") REFERENCES "template"."LearningGroupMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroupPostAttachment" ADD CONSTRAINT "LearningGroupPostAttachment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "template"."LearningGroupPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroupPostComment" ADD CONSTRAINT "LearningGroupPostComment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "template"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template"."LearningGroupPostComment" ADD CONSTRAINT "LearningGroupPostComment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "template"."LearningGroupPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Re-adding the performance/logic engine to the NEW table
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "template"."ScheduleSlot"
ADD COLUMN time_range TSRANGE
GENERATED ALWAYS AS (
  tsrange(
    ('2000-01-01'::date + start_time),
    ('2000-01-01'::date + end_time)
  )
) STORED;

ALTER TABLE "template"."ScheduleSlot"
ADD CONSTRAINT valid_time_range
CHECK (start_time < end_time);

ALTER TABLE "template"."ScheduleSlot"
ADD CONSTRAINT no_teacher_overlap
EXCLUDE USING GIST (
  semester_id WITH =,
  day_of_week WITH =,
  teacher_id WITH =,
  time_range WITH &&
);

ALTER TABLE "template"."ScheduleSlot"
ADD CONSTRAINT no_classroom_overlap
EXCLUDE USING GIST (
  semester_id WITH =,
  day_of_week WITH =,
  classroom_id WITH =,
  time_range WITH &&
);