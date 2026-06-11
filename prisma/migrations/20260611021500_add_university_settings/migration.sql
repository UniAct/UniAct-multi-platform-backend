CREATE TABLE IF NOT EXISTS "UniversitySettings" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "primary_color" TEXT NOT NULL DEFAULT '#2563eb',
    "secondary_color" TEXT NOT NULL DEFAULT '#7c3aed',
    "tab_name" TEXT,
    "logo_url" TEXT,
    "hero_images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversitySettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UniversitySettings_university_id_key" ON "UniversitySettings"("university_id");

ALTER TABLE "UniversitySettings"
ADD CONSTRAINT "UniversitySettings_university_id_fkey"
FOREIGN KEY ("university_id") REFERENCES "University"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "UniversitySettings" ("university_id", "updated_at")
SELECT "id", CURRENT_TIMESTAMP
FROM "University"
ON CONFLICT ("university_id") DO NOTHING;
