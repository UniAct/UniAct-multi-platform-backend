import { GetTenantClient } from "../Utils/prismaClient";

function randInt(max = 999999) {
  return Math.floor(Math.random() * max);
}

(async () => {
  const schema = "anu";
  const prisma = GetTenantClient(schema);
  const FACULTY_ID = 4;
  const SEMESTER_ID = 12;

  try {
    console.log(`Using schema: ${schema}`);

    const faculty = await prisma.faculty.findUnique({ where: { id: FACULTY_ID } });
    if (!faculty) {
      console.error(`Faculty ${FACULTY_ID} not found in schema ${schema}. Aborting.`);
      process.exit(1);
    }

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

    let programLevel = await prisma.programLevel.findFirst({ where: { programId: program.id, level: 1 } });
    if (!programLevel) {
      programLevel = await prisma.programLevel.create({ data: { programId: program.id, level: 1 } } as any);
      console.log("Created program level", programLevel.id);
    } else {
      console.log("Found program level", programLevel.id);
    }

    const STUDENT_COUNT = 5;

    for (let i = 0; i < STUDENT_COUNT; i++) {
      const suffix = `${Date.now()}${i}${randInt(9999)}`;
      const username = `seed_student_${suffix}`;
      const email = `${username}@example.com`;
      const nationalId = `NID${randInt(10000000)}`;

      const user = await prisma.user.create({
        data: {
          username,
          firstName: `First${i}`,
          lastName: `Last${i}`,
          email,
          password: "password",
          isVerified: true,
          isBlocked: false,
          phone: "0000000000",
          dateOfBirth: new Date(2000, 0, 1),
          address: "Seed address",
          city: "SeedCity",
          country: "SeedLand",
          nationalId: nationalId,
        } as any,
      });

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          universityStudentId: randInt(999999),
          programId: program.id,
          status: "New",
          enrollmentDate: new Date(),
          cgpa: 0.0,
          programLevelId: programLevel.id,
          religion: "M",
          gender: "M",
          fullname: `${(user as any).firstName} ${(user as any).lastName}`,
        } as any,
      });

      await prisma.courseRegistration.create({
        data: {
          studentId: user.id,
          semesterId: SEMESTER_ID,
          enrollmentDate: new Date(),
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
