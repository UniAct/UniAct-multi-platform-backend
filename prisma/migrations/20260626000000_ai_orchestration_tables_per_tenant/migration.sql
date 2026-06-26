CREATE TABLE IF NOT EXISTS "template"."projects" (
    "project_id" TEXT NOT NULL,
    "project_uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "projects_pkey" PRIMARY KEY ("project_id")
);

CREATE TABLE IF NOT EXISTS "template"."assets" (
    "asset_id" SERIAL NOT NULL,
    "asset_uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "asset_type" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "asset_size" INTEGER NOT NULL,
    "asset_config" JSONB,
    "asset_project_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "assets_pkey" PRIMARY KEY ("asset_id")
);

CREATE TABLE IF NOT EXISTS "template"."chunks" (
    "chunk_id" SERIAL NOT NULL,
    "chunk_uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chunk_text" TEXT NOT NULL,
    "chunk_metadata" JSONB,
    "chunk_order" INTEGER NOT NULL,
    "chunk_project_id" TEXT NOT NULL,
    "chunk_asset_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "chunks_pkey" PRIMARY KEY ("chunk_id")
);

CREATE TABLE IF NOT EXISTS "template"."sessions" (
    "session_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" TEXT NOT NULL,
    "title" TEXT,
    "filters" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id")
);

CREATE TABLE IF NOT EXISTS "template"."chat_messages" (
    "message_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("message_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "projects_project_uuid_key" ON "template"."projects"("project_uuid");

CREATE UNIQUE INDEX IF NOT EXISTS "assets_asset_uuid_key" ON "template"."assets"("asset_uuid");

CREATE INDEX IF NOT EXISTS "ix_asset_project_id" ON "template"."assets"("asset_project_id");

CREATE INDEX IF NOT EXISTS "ix_asset_type" ON "template"."assets"("asset_type");

CREATE UNIQUE INDEX IF NOT EXISTS "chunks_chunk_uuid_key" ON "template"."chunks"("chunk_uuid");

CREATE INDEX IF NOT EXISTS "ix_chunk_project_id" ON "template"."chunks"("chunk_project_id");

CREATE INDEX IF NOT EXISTS "ix_chunk_asset_id" ON "template"."chunks"("chunk_asset_id");

ALTER TABLE "template"."assets" DROP CONSTRAINT IF EXISTS "assets_asset_project_id_fkey";

ALTER TABLE "template"."assets"
ADD CONSTRAINT "assets_asset_project_id_fkey"
FOREIGN KEY ("asset_project_id") REFERENCES "template"."projects"("project_id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "template"."chunks" DROP CONSTRAINT IF EXISTS "chunks_chunk_project_id_fkey";

ALTER TABLE "template"."chunks"
ADD CONSTRAINT "chunks_chunk_project_id_fkey"
FOREIGN KEY ("chunk_project_id") REFERENCES "template"."projects"("project_id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "template"."chunks" DROP CONSTRAINT IF EXISTS "chunks_chunk_asset_id_fkey";

ALTER TABLE "template"."chunks"
ADD CONSTRAINT "chunks_chunk_asset_id_fkey"
FOREIGN KEY ("chunk_asset_id") REFERENCES "template"."assets"("asset_id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "template"."sessions" DROP CONSTRAINT IF EXISTS "sessions_project_id_fkey";

ALTER TABLE "template"."sessions"
ADD CONSTRAINT "sessions_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "template"."projects"("project_id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "template"."chat_messages" DROP CONSTRAINT IF EXISTS "chat_messages_session_id_fkey";

ALTER TABLE "template"."chat_messages"
ADD CONSTRAINT "chat_messages_session_id_fkey"
FOREIGN KEY ("session_id") REFERENCES "template"."sessions"("session_id")
ON DELETE CASCADE ON UPDATE NO ACTION;
