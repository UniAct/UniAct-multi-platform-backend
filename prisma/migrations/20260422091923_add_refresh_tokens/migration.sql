-- CreateTable
CREATE TABLE "template"."RefreshToken" (
    "id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_hash_key" ON "template"."RefreshToken"("token_hash");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_idx" ON "template"."RefreshToken"("user_id");

-- CreateIndex
CREATE INDEX "RefreshToken_expires_at_idx" ON "template"."RefreshToken"("expires_at");

-- CreateIndex
CREATE INDEX "RefreshToken_revoked_at_idx" ON "template"."RefreshToken"("revoked_at");

-- AddForeignKey
ALTER TABLE "template"."RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "template"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;