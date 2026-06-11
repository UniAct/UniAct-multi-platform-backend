CREATE TYPE "template"."AnnouncementType" AS ENUM ('ANNOUNCEMENT', 'EVENT');

CREATE TYPE "template"."AnnouncementAudience" AS ENUM ('ALL', 'STUDENTS', 'STAFF', 'FACULTY');

CREATE TYPE "template"."AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE IF NOT EXISTS "template"."Announcement" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "template"."AnnouncementType" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "audience" "template"."AnnouncementAudience" NOT NULL DEFAULT 'ALL',
    "status" "template"."AnnouncementStatus" NOT NULL DEFAULT 'PUBLISHED',
    "event_date" TIMESTAMP(3),
    "event_location" VARCHAR(300),
    "author_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Announcement_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "template"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Announcement_type_idx" ON "template"."Announcement"("type");
CREATE INDEX IF NOT EXISTS "Announcement_status_idx" ON "template"."Announcement"("status");
CREATE INDEX IF NOT EXISTS "Announcement_created_at_idx" ON "template"."Announcement"("created_at" DESC);
