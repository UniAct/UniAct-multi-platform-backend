CREATE TABLE IF NOT EXISTS "template"."RefreshToken" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key"
ON "template"."RefreshToken"("token");

CREATE INDEX IF NOT EXISTS "RefreshToken_expires_at_idx"
ON "template"."RefreshToken"("expires_at");

CREATE INDEX IF NOT EXISTS "RefreshToken_user_id_idx"
ON "template"."RefreshToken"("user_id");

ALTER TABLE "template"."RefreshToken"
ADD CONSTRAINT "RefreshToken_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "template"."User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;