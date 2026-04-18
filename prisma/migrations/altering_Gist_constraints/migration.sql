ALTER TABLE "template"."ScheduleSlot"
DROP CONSTRAINT no_teacher_overlap;

ALTER TABLE "template"."ScheduleSlot"
ADD CONSTRAINT no_teacher_overlap
EXCLUDE USING GIST (
  semester_id WITH =,
  day_of_week WITH =,
  teacher_id WITH =,
  program_id WITH =,
  time_range WITH &&
);

ALTER TABLE "template"."ScheduleSlot"
DROP CONSTRAINT no_classroom_overlap;

ALTER TABLE "template"."ScheduleSlot"
ADD CONSTRAINT no_classroom_overlap
EXCLUDE USING GIST (
  semester_id WITH =,
  day_of_week WITH =,
  classroom_id WITH =,
  program_id WITH =,
  time_range WITH &&
);