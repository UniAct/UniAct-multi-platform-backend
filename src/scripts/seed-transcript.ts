import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { GetTenantClient } from "../Utils/prismaClient";
import { ProgramType, CourseAssessmentType, SemesterType, ClassroomType, DayOfWeek, CourseType } from "@prisma/client";

dotenv.config();

async function findOrCreateScheduleSlot(
  tx: any,
  data: {
    teacherId: number;
    courseId: number;
    classroomId: number;
    semesterId: number;
    dayOfWeek: DayOfWeek;
    startTime: Date;
    endTime: Date;
    allowedCapacity: number;
  }
) {
  const existing = await tx.scheduleSlot.findUnique({
    where: {
      semesterId_teacherId_classroomId_dayOfWeek_startTime_endTime: {
        semesterId: data.semesterId,
        teacherId: data.teacherId,
        classroomId: data.classroomId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return tx.scheduleSlot.create({ data });
}

async function findOrCreateCourseAssessment(
  tx: any,
  data: {
    courseId: number;
    semesterId: number;
    label: string;
    assessmentType: CourseAssessmentType;
    marks: number;
  }
) {
  const existing = await tx.courseAssessment.findFirst({
    where: {
      courseId: data.courseId,
      semesterId: data.semesterId,
      label: data.label,
      assessmentType: data.assessmentType,
    },
  });

  if (existing) {
    return existing;
  }

  return tx.courseAssessment.create({ data });
}

function quoteSchemaIdentifier(schema: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
    throw new Error(`Invalid schema name '${schema}'`);
  }

  return `"${schema}"`;
}

async function ensureTranscriptTestSchema(prisma: ReturnType<typeof GetTenantClient>, schema: string) {
  const quotedSchema = quoteSchemaIdentifier(schema);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE ${quotedSchema}."CourseRegistration"
    ALTER COLUMN "grade_points" TYPE DECIMAL(5,4)
    USING "grade_points"::DECIMAL(5,4)
  `);
}

async function main() {
  const schema = process.argv[2] || process.env.SCHEMA || process.env.DEFAULT_TENANT_SCHEMA || "anu";
  const prisma = GetTenantClient(schema);

  console.log(`Seeding transcript test data into schema '${schema}'...`);
  await ensureTranscriptTestSchema(prisma, schema);

  // Ensure a University record exists in the public schema so AttachAndValidateTenant can map requests.
  const universityName = `Test University ${schema}`;
  try {
    const publicClient = GetTenantClient("public");
    await publicClient.university.upsert({
      where: { db_schema: schema },
      update: {
        name: universityName,
        is_active: true,
      },
      create: {
        name: universityName,
        db_schema: schema,
        is_active: true,
      },
    });
    console.log(`Registered Test University in public schema for tenant '${schema}'`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("Could not upsert public University record:", message);
  }

  await prisma.$transaction(async (tx) => {
    // 1. University (tenant public metadata already upserted)
    const publicClient = GetTenantClient("public");
    const university = await publicClient.university.findUnique({
      where: { db_schema: schema },
    });

    if (!university) {
      throw new Error(`University record not found in public schema for '${schema}'. Please seed the public University first.`);
    }

    // 2. Faculty
    let faculty = await tx.faculty.findFirst({
      where: { name: "Transcript Test Faculty" },
    });

    if (!faculty) {
      faculty = await tx.faculty.create({
        data: {
          name: "Transcript Test Faculty",
          universityId: university.id,
        },
      });
    }

    let regulation = await tx.regulation.findFirst({
      where: {
        facultyId: faculty.id,
        name: "Transcript Test Regulation",
      },
    });

    const regulationData = {
      facultyId: faculty.id,
      name: "Transcript Test Regulation",
      roundToWholeNumber: false,
      approximateFractions: false,
      enableMercyRules: true,
      minGradeExcellent: 85,
      minGradeVeryGood: 70,
      minGradeGood: 60,
      minGradeAcceptable: 50,
      minGradeVeryWeak: 0,
    };

    if (regulation) {
      regulation = await tx.regulation.update({
        where: { id: regulation.id },
        data: regulationData,
      });
    } else {
      regulation = await tx.regulation.create({
        data: regulationData,
      });
    }

    await tx.mercyRule.deleteMany({
      where: { regulationId: regulation.id },
    });

    await tx.mercyRule.create({
      data: {
        regulationId: regulation.id,
        originalScore: 64,
        adjustedScore: 70,
      },
    });

    // 3. Program + ProgramLevel
    const program = await tx.program.upsert({
      where: { name: "Transcript Test Program" },
      update: {},
      create: {
        name: "Transcript Test Program",
        facultyId: faculty.id,
        programType: ProgramType.Bachelor,
      },
    });

    const programLevel = await tx.programLevel.upsert({
      where: { programId_level: { programId: program.id, level: 1 } },
      update: {},
      create: {
        programId: program.id,
        level: 1,
        minCredits: 0,
        maxCredits: 100,
      },
    });

    const programLevel2 = await tx.programLevel.upsert({
      where: { programId_level: { programId: program.id, level: 2 } },
      update: {},
      create: {
        programId: program.id,
        level: 2,
        minCredits: 0,
        maxCredits: 100,
      },
    });

    const programLevel3 = await tx.programLevel.upsert({
      where: { programId_level: { programId: program.id, level: 3 } },
      update: {},
      create: {
        programId: program.id,
        level: 3,
        minCredits: 0,
        maxCredits: 100,
      },
    });

    const programLevel4 = await tx.programLevel.upsert({
      where: { programId_level: { programId: program.id, level: 4 } },
      update: {},
      create: {
        programId: program.id,
        level: 4,
        minCredits: 0,
        maxCredits: 100,
      },
    });

    // 4. Semester
    const semester = await tx.semester.upsert({
      where: { year_term: { year: 2026, term: 1 } },
      update: {},
      create: {
        year: 2026,
        term: 1,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-06-01"),
        type: SemesterType.Fall,
      },
    });

    // 4. Create a classroom
    const classroom = await tx.classroom.upsert({
      where: { classroomNumber_building: { classroomNumber: "C101", building: "Main" } },
      update: {},
      create: { classroomNumber: "C101", building: "Main", capacity: 100, type: ClassroomType.Hall },
    });

    // 5. Create a teacher user + staff
    const teacherUser = await tx.user.upsert({
      where: { email: "teacher@test.local" },
      update: {
        isVerified: true,
      },
      create: {
        username: "teacher1",
        firstName: "Test",
        lastName: "Teacher",
        email: "teacher@test.local",
        password: await bcrypt.hash("password", 10),
        phone: "0700000000",
        dateOfBirth: new Date("1990-01-01"),
        address: "Campus",
        city: "TestCity",
        country: "TC",
        nationalId: "TCHR001",
        isVerified: true,
      },
    });

    await tx.staff.upsert({
      where: { userId: teacherUser.id },
      update: {},
      create: { userId: teacherUser.id, position: "Lecturer", hireDate: new Date("2020-01-01"), salary: 1000 },
    });

    const role = await tx.role.upsert({
      where: { name: "TranscriptTester" },
      update: {},
      create: { name: "TranscriptTester", description: "Can authenticate for transcript Postman tests" },
    });

    await tx.userRole.upsert({
      where: { userId_roleId: { userId: teacherUser.id, roleId: role.id } },
      update: {},
      create: { userId: teacherUser.id, roleId: role.id },
    });

    // 6. Create 1 student user + student record
    const studentUser = await tx.user.upsert({
      where: { email: "student1@test.local" },
      update: {
        isVerified: true,
      },
      create: {
        username: "student1",
        firstName: "Test",
        lastName: "Student",
        email: "student1@test.local",
        password: await bcrypt.hash("password", 10),
        phone: "0700000001",
        dateOfBirth: new Date("2000-01-01"),
        address: "StudentAddress",
        city: "TestCity",
        country: "TC",
        nationalId: "STUD001",
        isVerified: true,
      },
    });

    const student = await tx.student.upsert({
      where: { userId: studentUser.id },
      update: {
        programId: program.id,
        programLevelId: programLevel.id,
      },
      create: {
        userId: studentUser.id,
        universityStudentId: 1001,
        programId: program.id,
        enrollmentDate: new Date(),
        programLevelId: programLevel.id,
        religion: "X",
        gender: "M",
      },
    });

    const student2User = await tx.user.upsert({
      where: { email: "student2@test.local" },
      update: {
        isVerified: true,
      },
      create: {
        username: "student2",
        firstName: "Second",
        lastName: "Student",
        email: "student2@test.local",
        password: await bcrypt.hash("password", 10),
        phone: "0700000002",
        dateOfBirth: new Date("2000-02-01"),
        address: "StudentAddress2",
        city: "TestCity",
        country: "TC",
        nationalId: "STUD002",
        isVerified: true,
      },
    });

    const student2 = await tx.student.upsert({
      where: { userId: student2User.id },
      update: {
        programId: program.id,
        programLevelId: programLevel2.id,
      },
      create: {
        userId: student2User.id,
        universityStudentId: 1002,
        programId: program.id,
        enrollmentDate: new Date(),
        programLevelId: programLevel2.id,
        religion: "X",
        gender: "F",
      },
    });

    const student3User = await tx.user.upsert({
      where: { email: "student3@test.local" },
      update: {
        isVerified: true,
      },
      create: {
        username: "student3",
        firstName: "Third",
        lastName: "Student",
        email: "student3@test.local",
        password: await bcrypt.hash("password", 10),
        phone: "0700000003",
        dateOfBirth: new Date("2000-03-01"),
        address: "StudentAddress3",
        city: "TestCity",
        country: "TC",
        nationalId: "STUD003",
        isVerified: true,
      },
    });

    const student3 = await tx.student.upsert({
      where: { userId: student3User.id },
      update: {
        programId: program.id,
        programLevelId: programLevel3.id,
      },
      create: {
        userId: student3User.id,
        universityStudentId: 1003,
        programId: program.id,
        enrollmentDate: new Date(),
        programLevelId: programLevel3.id,
        religion: "X",
        gender: "M",
      },
    });

    const student4User = await tx.user.upsert({
      where: { email: "student4@test.local" },
      update: {
        isVerified: true,
      },
      create: {
        username: "student4",
        firstName: "Fourth",
        lastName: "Student",
        email: "student4@test.local",
        password: await bcrypt.hash("password", 10),
        phone: "0700000004",
        dateOfBirth: new Date("2000-04-01"),
        address: "StudentAddress4",
        city: "TestCity",
        country: "TC",
        nationalId: "STUD004",
        isVerified: true,
      },
    });

    const student4 = await tx.student.upsert({
      where: { userId: student4User.id },
      update: {
        programId: program.id,
        programLevelId: programLevel4.id,
      },
      create: {
        userId: student4User.id,
        universityStudentId: 1004,
        programId: program.id,
        enrollmentDate: new Date(),
        programLevelId: programLevel4.id,
        religion: "X",
        gender: "F",
      },
    });

    // 7. Courses
    const course1 = await tx.course.upsert({
      where: { code: "TEST101" },
      update: {},
      create: { name: "Intro Test", code: "TEST101", credits: 3, successPercentage: 50, totalFail: false },
    });

    const course2 = await tx.course.upsert({
      where: { code: "TEST102" },
      update: {},
      create: { name: "Advanced Test", code: "TEST102", credits: 4, successPercentage: 50, totalFail: false },
    });

    const course3 = await tx.course.upsert({
      where: { code: "TEST301" },
      update: {},
      create: { name: "Level Three Test", code: "TEST301", credits: 3, successPercentage: 50, totalFail: false },
    });

    const course4 = await tx.course.upsert({
      where: { code: "TEST401" },
      update: {},
      create: { name: "Level Four Test", code: "TEST401", credits: 3, successPercentage: 50, totalFail: false },
    });

    await tx.programCourse.upsert({
      where: { programLevelId_courseId: { programLevelId: programLevel.id, courseId: course1.id } },
      update: {},
      create: { programId: program.id, programLevelId: programLevel.id, courseId: course1.id, type: CourseType.Mandatory },
    });

    await tx.programCourse.upsert({
      where: { programLevelId_courseId: { programLevelId: programLevel.id, courseId: course2.id } },
      update: {},
      create: { programId: program.id, programLevelId: programLevel.id, courseId: course2.id, type: CourseType.Mandatory },
    });

    await tx.programCourse.upsert({
      where: { programLevelId_courseId: { programLevelId: programLevel2.id, courseId: course1.id } },
      update: {},
      create: { programId: program.id, programLevelId: programLevel2.id, courseId: course1.id, type: CourseType.Mandatory },
    });

    await tx.programCourse.upsert({
      where: { programLevelId_courseId: { programLevelId: programLevel3.id, courseId: course3.id } },
      update: {},
      create: { programId: program.id, programLevelId: programLevel3.id, courseId: course3.id, type: CourseType.Mandatory },
    });

    await tx.programCourse.upsert({
      where: { programLevelId_courseId: { programLevelId: programLevel4.id, courseId: course4.id } },
      update: {},
      create: { programId: program.id, programLevelId: programLevel4.id, courseId: course4.id, type: CourseType.Mandatory },
    });

    // 8. Create schedule slots
    const slot1 = await findOrCreateScheduleSlot(tx, {
      teacherId: teacherUser.id,
      courseId: course1.id,
      classroomId: classroom.id,
      semesterId: semester.id,
      dayOfWeek: DayOfWeek.Monday,
      startTime: new Date("1970-01-01T08:00:00Z"),
      endTime: new Date("1970-01-01T09:30:00Z"),
      allowedCapacity: 100,
    });

    const slot2 = await findOrCreateScheduleSlot(tx, {
      teacherId: teacherUser.id,
      courseId: course2.id,
      classroomId: classroom.id,
      semesterId: semester.id,
      dayOfWeek: DayOfWeek.Tuesday,
      startTime: new Date("1970-01-01T10:00:00Z"),
      endTime: new Date("1970-01-01T11:30:00Z"),
      allowedCapacity: 100,
    });

    // 9. Schedule slot contexts
    const ctx1 = await tx.scheduleSlotContext.upsert({
      where: { semesterId_slotId_programId: { semesterId: semester.id, slotId: slot1.id, programId: program.id } },
      update: { academicLevel: 1 },
      create: { slotId: slot1.id, programId: program.id, academicLevel: 1, semesterId: semester.id },
    });

    const ctx2 = await tx.scheduleSlotContext.upsert({
      where: { semesterId_slotId_programId: { semesterId: semester.id, slotId: slot2.id, programId: program.id } },
      update: { academicLevel: 1 },
      create: { slotId: slot2.id, programId: program.id, academicLevel: 1, semesterId: semester.id },
    });

    const slot3 = await findOrCreateScheduleSlot(tx, {
      teacherId: teacherUser.id,
      courseId: course1.id,
      classroomId: classroom.id,
      semesterId: semester.id,
      dayOfWeek: DayOfWeek.Wednesday,
      startTime: new Date("1970-01-01T12:00:00Z"),
      endTime: new Date("1970-01-01T13:30:00Z"),
      allowedCapacity: 100,
    });

    const ctx3 = await tx.scheduleSlotContext.upsert({
      where: { semesterId_slotId_programId: { semesterId: semester.id, slotId: slot3.id, programId: program.id } },
      update: { academicLevel: 2 },
      create: { slotId: slot3.id, programId: program.id, academicLevel: 2, semesterId: semester.id },
    });

    const slot4 = await findOrCreateScheduleSlot(tx, {
      teacherId: teacherUser.id,
      courseId: course3.id,
      classroomId: classroom.id,
      semesterId: semester.id,
      dayOfWeek: DayOfWeek.Thursday,
      startTime: new Date("1970-01-01T14:00:00Z"),
      endTime: new Date("1970-01-01T15:30:00Z"),
      allowedCapacity: 100,
    });

    const ctx4 = await tx.scheduleSlotContext.upsert({
      where: { semesterId_slotId_programId: { semesterId: semester.id, slotId: slot4.id, programId: program.id } },
      update: { academicLevel: 3 },
      create: { slotId: slot4.id, programId: program.id, academicLevel: 3, semesterId: semester.id },
    });

    const slot5 = await findOrCreateScheduleSlot(tx, {
      teacherId: teacherUser.id,
      courseId: course4.id,
      classroomId: classroom.id,
      semesterId: semester.id,
      dayOfWeek: DayOfWeek.Friday,
      startTime: new Date("1970-01-01T16:00:00Z"),
      endTime: new Date("1970-01-01T17:30:00Z"),
      allowedCapacity: 100,
    });

    const ctx5 = await tx.scheduleSlotContext.upsert({
      where: { semesterId_slotId_programId: { semesterId: semester.id, slotId: slot5.id, programId: program.id } },
      update: { academicLevel: 4 },
      create: { slotId: slot5.id, programId: program.id, academicLevel: 4, semesterId: semester.id },
    });

    // 10. Course registrations for student
    const reg1 = await tx.courseRegistration.upsert({
      where: { studentId_slotContextId_semesterId: { studentId: student.userId, slotContextId: ctx1.id, semesterId: semester.id } },
      update: { status: "Enrolled", grade: null, gradePoints: null },
      create: { studentId: student.userId, semesterId: semester.id, slotContextId: ctx1.id, status: "Enrolled" },
    });

    const reg2 = await tx.courseRegistration.upsert({
      where: { studentId_slotContextId_semesterId: { studentId: student.userId, slotContextId: ctx2.id, semesterId: semester.id } },
      update: { status: "Enrolled", grade: null, gradePoints: null },
      create: { studentId: student.userId, semesterId: semester.id, slotContextId: ctx2.id, status: "Enrolled" },
    });

    const reg3 = await tx.courseRegistration.upsert({
      where: { studentId_slotContextId_semesterId: { studentId: student2.userId, slotContextId: ctx3.id, semesterId: semester.id } },
      update: { status: "Enrolled", grade: null, gradePoints: null },
      create: { studentId: student2.userId, semesterId: semester.id, slotContextId: ctx3.id, status: "Enrolled" },
    });

    const reg4 = await tx.courseRegistration.upsert({
      where: { studentId_slotContextId_semesterId: { studentId: student3.userId, slotContextId: ctx4.id, semesterId: semester.id } },
      update: { status: "Enrolled", grade: null, gradePoints: null },
      create: { studentId: student3.userId, semesterId: semester.id, slotContextId: ctx4.id, status: "Enrolled" },
    });

    const reg5 = await tx.courseRegistration.upsert({
      where: { studentId_slotContextId_semesterId: { studentId: student4.userId, slotContextId: ctx5.id, semesterId: semester.id } },
      update: { status: "Enrolled", grade: null, gradePoints: null },
      create: { studentId: student4.userId, semesterId: semester.id, slotContextId: ctx5.id, status: "Enrolled" },
    });

    // 11. Course assessments
    const ca1 = await findOrCreateCourseAssessment(tx, {
      courseId: course1.id,
      semesterId: semester.id,
      label: "Final",
      assessmentType: CourseAssessmentType.Final,
      marks: 100,
    });

    const ca2 = await findOrCreateCourseAssessment(tx, {
      courseId: course2.id,
      semesterId: semester.id,
      label: "Final",
      assessmentType: CourseAssessmentType.Final,
      marks: 100,
    });

    const ca3 = await findOrCreateCourseAssessment(tx, {
      courseId: course3.id,
      semesterId: semester.id,
      label: "Final",
      assessmentType: CourseAssessmentType.Final,
      marks: 100,
    });

    const ca4 = await findOrCreateCourseAssessment(tx, {
      courseId: course4.id,
      semesterId: semester.id,
      label: "Final",
      assessmentType: CourseAssessmentType.Final,
      marks: 100,
    });

    // 12. Grades
    await tx.grade.deleteMany({
      where: { courseRegistrationId: { in: [reg1.id, reg2.id, reg3.id, reg4.id, reg5.id] } },
    });

    await tx.grade.create({
      data: { courseRegistrationId: reg1.id, courseAssessmentId: ca1.id, marks: 80, maxMarks: 100 },
    });

    await tx.grade.create({
      data: { courseRegistrationId: reg2.id, courseAssessmentId: ca2.id, marks: 70, maxMarks: 100 },
    });

    await tx.grade.create({
      data: { courseRegistrationId: reg3.id, courseAssessmentId: ca1.id, marks: 90, maxMarks: 100 },
    });

    await tx.grade.create({
      data: { courseRegistrationId: reg4.id, courseAssessmentId: ca3.id, marks: 65, maxMarks: 100 },
    });

    await tx.grade.create({
      data: { courseRegistrationId: reg5.id, courseAssessmentId: ca4.id, marks: 45, maxMarks: 100 },
    });

    // 13. Program transcript definitions
    const transcriptDefinitions = [
      { gradeLetter: "A", minScore: 85, maxScore: 100, minGpa: 3.6, maxGpa: 4.0 },
      { gradeLetter: "B", minScore: 70, maxScore: 84, minGpa: 3.0, maxGpa: 3.59 },
      { gradeLetter: "C", minScore: 50, maxScore: 69, minGpa: 2.0, maxGpa: 2.99 },
      { gradeLetter: "F", minScore: 0, maxScore: 49, minGpa: 0.0, maxGpa: 0.0 },
    ] as const;

    for (const definition of transcriptDefinitions) {
      await tx.programTranscriptDefinition.upsert({
        where: {
          programId_gradeLetter: {
            programId: program.id,
            gradeLetter: definition.gradeLetter,
          },
        },
        update: {
          minScore: definition.minScore,
          maxScore: definition.maxScore,
          minGpa: definition.minGpa,
          maxGpa: definition.maxGpa,
        },
        create: {
          programId: program.id,
          ...definition,
        },
      });
    }

    console.log("Seeding completed.");
    console.log(`University header/name: ${universityName}`);
    console.log(`Login: teacher@test.local / password`);
    console.log(`Semester ID: ${semester.id}`);
    console.log(`Faculty ID: ${faculty.id}`);
    console.log(`Student IDs by level: L1=${student.userId}, L2=${student2.userId}, L3=${student3.userId}, L4=${student4.userId}`);
  }, { timeout: 30000 });

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
