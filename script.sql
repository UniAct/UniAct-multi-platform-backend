-- queries will be used latter

SELECT 
  u.first_name || ' ' || u.last_name AS "full_name",
  sfr.amount,
  f.fee_type,
  p.name AS program_name,
  pl.level AS program_level,
  smr.term,
  smr.type,
  smr.year
FROM
  anu."StudentFeeReport" as sfr JOIN anu."Fee" AS f ON f.id = sfr.fee_id
  JOIN anu."Semester" AS smr ON sfr.semester_id = smr.id
  JOIN  anu."ProgramLevel" AS pl ON pl.id = sfr.program_level_id
  JOIN anu."Program" AS p ON p.id = pl.program_id
  JOIN anu."User" AS u ON u.id = sfr.student_id
WHERE sfr.student_id = 34;