ALTER TABLE "template"."CourseRegistration"
  ALTER COLUMN "grade_points" TYPE DECIMAL(5,4)
  USING "grade_points"::DECIMAL(5,4);
