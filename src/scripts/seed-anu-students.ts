import { GetTenantClient } from "../Utils/prismaClient";

function randInt(max = 999999) {
  return Math.floor(Math.random() * max);
}

(async () => {
  const schema = "anu";
  const prisma = GetTenantClient(schema);

  try {
    console.log(`Using schema: ${schema}`);

    // Ensure a university exists
    let university = await prisma.university.findFirst();
    if (!university) {
      university = await prisma.university.create({
        data: {
          name: `ANU Test University ${Date.now()}`,
          address: "Seeded address",
          phone: "0000000000",
          email: "seed@anu.test",
          website: "https://anu.test",
          established_date: new Date(),
          accreditation: "Seed",
          db_schema: schema,
          is_active: true,
        },
      });
      console.log("Created university", university.id);
    } else {
      console.log("Found university", university.id);
    }

    // Ensure faculty with id=4 exists
    const FACULTY_ID = 4;
    let faculty = await prisma.faculty.findUnique({ where: { id: FACULTY_ID } });
    if (!faculty) {
      faculty = await prisma.faculty.create({
        data: {
          id: FACULTY_ID,
          universityId: university.id,
          name: `Seed Faculty ${FACULTY_ID}`,
          description: "Seeded faculty for transcript testing",
        },
      });
      console.log("Created faculty", faculty.id);
    } else {
      console.log("Found faculty", faculty.id);
    }

    // Ensure semester with id=12 exists
    const SEMESTER_ID = 12;
    let semester = await prisma.semester.findUnique({ where: { id: SEMESTER_ID } });
    if (!semester) {
      semester = await prisma.semester.create({
        data: {
          id: SEMESTER_ID,
          year: new Date().getFullYear(),
          term: 1,
          start_date: new Date(),
          end_date: new Date(new Date().setMonth(new Date().getMonth() + 4)),
          type: "Fall",
        } as any,
      });
      console.log("Created semester", semester.id);
    } else {
      console.log("Found semester", semester.id);
    }

    // Ensure a program exists for this faculty
    let program = await prisma.program.findFirst({ where: { facultyId: FACULTY_ID } });
    if (!program) {
      program = await prisma.program.create({
        data: {
          facultyId: FACULTY_ID,
          name: `Seed Program for Faculty ${FACULTY_ID} ${Date.now()}`,
          programType: "Bachelor",
          resultDisplay: "CourseGrade",
        } as any,
      });
      console.log("Created program", program.id);
    } else {
      console.log("Found program", program.id);
    }

    // Ensure a program level exists
    let programLevel = await prisma.programLevel.findFirst({ where: { programId: program.id, level: 1 } });
    if (!programLevel) {
      programLevel = await prisma.programLevel.create({ data: { programId: program.id, level: 1 } } as any);
      console.log("Created program level", programLevel.id);
    } else {
      console.log("Found program level", programLevel.id);
    }

    // Create 5 students
    const STUDENT_COUNT = 5;

    for (let i = 0; i < STUDENT_COUNT; i++) {
      const suffix = `${Date.now()}${i}${randInt(9999)}`;
      const username = `seed_student_${suffix}`;
      const email = `${username}@example.com`;
      const nationalId = `NID${randInt(10000000)}`;

      const user = await prisma.user.create({
        data: {
          username,
          first_name: `First${i}`,
          last_name: `Last${i}`,
          email,
          password: "password",
          is_verified: true,
          is_blocked: false,
          phone: "0000000000",
          date_of_birth: new Date(2000, 0, 1),
          address: "Seed address",
          city: "SeedCity",
          country: "SeedLand",
          national_id: nationalId,
        } as any,
      });

      const student = await prisma.student.create({
        data: {
          user_id: user.id,
          university_student_id: randInt(999999),
          programId: program.id,
          status: "New",
          enrollment_date: new Date(),
          cgpa: 0.0,
          program_level_id: programLevel.id,
          religion: "M",
          gender: "M",
          fullname: `${(user as any).first_name} ${(user as any).last_name}`,
        } as any,
      });

      // Create a single course registration for this semester
      await prisma.courseRegistration.create({
        data: {
          student_id: user.id,
          semester_id: SEMESTER_ID,
          enrollment_date: new Date(),
          status: "Enrolled",
        } as any,
      });

      console.log(`Created student ${user.id} and registration for semester ${SEMESTER_ID}`);
    }

    console.log(`Seeding complete: created ${STUDENT_COUNT} students in schema ${schema}`);
  } catch (err: any) {
    console.error("Seeding failed:", err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
