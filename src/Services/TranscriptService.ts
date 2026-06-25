import { CourseAssessmentType, GradeEnum, PrismaClient, RegistrationStatus, Transcript } from "@prisma/client";
import { TranscriptRepository } from "../Repositories/TranscriptRepository";
import { NotFoundError, BadRequestError } from "../Types/Errors";
import { StudentTranscriptSemestersDto, TranscriptBatchGenerationSummaryDto, TranscriptCourseDto, TranscriptDto, TranscriptSemesterInfoDto } from "../Interfaces/Transcript/TranscriptDto";
import { JobRepository } from "../Repositories/JobRepository";
import { QueueTranscriptGenerationJob } from "../Workers/Transcript/Transcript.Queue";
import { GetTenantClient } from "../Utils/prismaClient";
import { MapTranscript } from "../Interfaces/Transcript/Mapper";

type TranscriptDefinition = {
  minScore: any;
  maxScore: any;
  gradeLetter: any;
  minGpa: any;
  maxGpa: any;
};

type CourseRegistrationWithRelations = {
  status: RegistrationStatus;
  id: number;
  grades: Array<{
    marks: any;
    maxMarks: any;
    courseAssessment: {
      assessmentType: CourseAssessmentType;
    };
  }>;
  scheduleSlotContext: {
    slot: {
      course: {
        code: string;
        credits: number;
        totalFail: boolean;
        successPercentage: number | null;
        minFinalSuccessPercentage: number | null;
      };
    };
  } | null;
};

type TranscriptCourse = NonNullable<CourseRegistrationWithRelations["scheduleSlotContext"]>["slot"]["course"];

type CompletedCourseRegistrationWithRelations = {
  id: number;
  semesterId: number;
  gradePoints: any;
  scheduleSlotContext: {
    slot: {
      course: {
        credits: number;
      };
    };
  } | null;
};

type TranscriptCourseRow = Awaited<ReturnType<typeof TranscriptRepository.GetTranscriptCourseRows>>[number];
type TranscriptWithSemester = Awaited<ReturnType<typeof TranscriptRepository.GetStudentTranscripts>>[number];

function CalculateRawScore(grades: Array<{ marks: any; maxMarks: any }>) {
  const totalMarks = grades.reduce((sum, grade) => sum + Number(grade.marks), 0);
  const totalMaxMarks = grades.reduce((sum, grade) => sum + Number(grade.maxMarks), 0);

  if (totalMaxMarks === 0) {
    return 0;
  }

  return (totalMarks / totalMaxMarks) * 100;
}

function ApplyRegulationRules(
  score: number,
  regulation?: { roundToWholeNumber: boolean; approximateFractions: boolean } | null
) {
  if (!regulation) {
    return score;
  }

  if (regulation.roundToWholeNumber) {
    return Math.round(score);
  }

  if (regulation.approximateFractions) {
    return Math.round(score);
  }

  return score;
}

function ApplyMercyRules(
  score: number,
  regulation?:
    | { enableMercyRules: boolean; mercyRules?: Array<{ originalScore: any; adjustedScore: any }> }
    | null
) {
  if (!regulation || !regulation.enableMercyRules || !regulation.mercyRules) {
    return score;
  }

  const matchedRule = regulation.mercyRules.find((rule) => {
    const originalScore = Number(rule.originalScore);
    const adjustedScore = Number(rule.adjustedScore);
    return score >= originalScore && score < adjustedScore;
  });

  if (!matchedRule) {
    return score;
  }

  const adjusted = Number(matchedRule.adjustedScore);
  return adjusted > score ? adjusted : score;
}

function FindTranscriptDefinition(score: number, definitions: TranscriptDefinition[]) {
  return definitions.find((definition) => {
    const minScore = Number(definition.minScore);
    const maxScore = Number(definition.maxScore);
    return score >= minScore && score <= maxScore;
  });
}

function GetGradePointsFromDefinition(definition: { minGpa: any; maxGpa: any }) {
  const minGpa = Number(definition.minGpa);
  const maxGpa = Number(definition.maxGpa);
  return Number(((minGpa + maxGpa) / 2).toFixed(4));
}

function CalculateFinalAssessmentScore(grades: CourseRegistrationWithRelations["grades"]) {
  const finalGrades = grades.filter((grade) => {
    return grade.courseAssessment.assessmentType === CourseAssessmentType.Final;
  });

  if (finalGrades.length === 0) {
    return null;
  }

  return CalculateRawScore(finalGrades);
}

function IsFailedCourse(
  totalScore: number,
  finalAssessmentScore: number | null,
  course: TranscriptCourse
) {
  const successPercentage =
    course.successPercentage !== null && course.successPercentage !== undefined
      ? Number(course.successPercentage)
      : 50;

  if (totalScore < successPercentage) {
    return true;
  }

  if (!course.totalFail || course.minFinalSuccessPercentage === null || course.minFinalSuccessPercentage === undefined) {
    return false;
  }

  if (finalAssessmentScore === null) {
    throw new BadRequestError(`Final assessment grade is required for course ${course.code}`);
  }

  return finalAssessmentScore < Number(course.minFinalSuccessPercentage);
}

function MapTranscriptCourseRows(rows: TranscriptCourseRow[]): TranscriptCourseDto[] {
  return rows.map((row) => {
    const course = row.scheduleSlotContext?.slot.course;
    const totalMarks = row.grades.reduce((sum, grade) => sum + Number(grade.marks), 0);
    const totalMaxMarks = row.grades.reduce((sum, grade) => sum + Number(grade.maxMarks), 0);

    return {
      registrationId: row.id,
      courseCode: course?.code ?? null,
      courseName: course?.name ?? null,
      credits: course?.credits ?? 0,
      grade: row.grade ?? null,
      gradePoints:
        row.gradePoints === null || row.gradePoints === undefined
          ? null
          : Number(row.gradePoints),
      status: row.status,
      totalMarks: Number(totalMarks.toFixed(4)),
      totalMaxMarks: Number(totalMaxMarks.toFixed(4)),
      scorePercentage:
        totalMaxMarks === 0
          ? null
          : Number(((totalMarks / totalMaxMarks) * 100).toFixed(4)),
    };
  });
}

function MapSemesterInfo(
  semester: Awaited<ReturnType<typeof TranscriptRepository.GetSemesterById>>
): TranscriptSemesterInfoDto | null {
  if (!semester) {
    return null;
  }

  return {
    id: semester.id,
    year: semester.year,
    term: semester.term,
    type: semester.type,
    startDate: semester.startDate.toISOString(),
    endDate: semester.endDate.toISOString(),
  };
}

async function MapTranscriptWithCourses(
  transcript: Transcript | TranscriptWithSemester,
  prisma: PrismaClient
): Promise<TranscriptDto> {
  const courseRows = await TranscriptRepository.GetTranscriptCourseRows(
    transcript.studentId,
    transcript.semesterId,
    prisma
  );

  const semester = "semester" in transcript
    ? MapSemesterInfo(transcript.semester)
    : MapSemesterInfo(await TranscriptRepository.GetSemesterById(transcript.semesterId, prisma));

  return MapTranscript(transcript, MapTranscriptCourseRows(courseRows), semester);
}

async function GenerateStudentTranscript(
  studentId: number,
  semesterId: number,
  prisma: ReturnType<typeof GetTenantClient>
) {
  // DB operations are handled inside the repository to keep services free from direct persistence flow.
  // The service keeps only the orchestration + computation helpers.
  return prisma.$transaction(async (tx) => {
    const transcriptRepository = {
      getStudentById: (id: number) => TranscriptRepository.GetStudentById(id, tx),
      getSemesterById: (id: number) => TranscriptRepository.GetSemesterById(id, tx),
      getProgramById: (id: number) => TranscriptRepository.GetProgramById(id, tx),
      getFacultyRegulationWithMercyRules: (id: number) =>
        TranscriptRepository.GetFacultyRegulationWithMercyRules(id, tx),
      getProgramTranscriptDefinitions: (id: number) =>
        TranscriptRepository.GetProgramTranscriptDefinitions(id, tx) as unknown as TranscriptDefinition[],
      getCourseRegistrationsForSemester: (studentId2: number, semesterId2: number) =>
        TranscriptRepository.GetCourseRegistrationsForSemester(studentId2, semesterId2, tx) as unknown as CourseRegistrationWithRelations[],
      updateCourseRegistrationGrade: (courseRegistrationId: number, payload: any) =>
        TranscriptRepository.UpdateCourseRegistrationGrade(courseRegistrationId, payload, tx),
      getCompletedCourseRegistrations: (studentId2: number) =>
        TranscriptRepository.GetCompletedCourseRegistrations(studentId2, tx) as unknown as CompletedCourseRegistrationWithRelations[],
    };

    const student = await transcriptRepository.getStudentById(studentId);
    if (!student) {
      throw new NotFoundError("Student not found");
    }

    const semester = await transcriptRepository.getSemesterById(semesterId);
    if (!semester) {
      throw new NotFoundError("Semester not found");
    }

    const program = await transcriptRepository.getProgramById(student.programId);
    if (!program) {
      throw new NotFoundError("Program not found for the student");
    }

    const regulation = await transcriptRepository.getFacultyRegulationWithMercyRules(program.facultyId);
    const definitions = await transcriptRepository.getProgramTranscriptDefinitions(program.id);

    if (!definitions || definitions.length === 0) {
      throw new NotFoundError("Program transcript grade definitions are not configured");
    }

    const registrations = await transcriptRepository.getCourseRegistrationsForSemester(studentId, semesterId);
    if (!registrations || registrations.length === 0) {
      throw new NotFoundError(
        "No course registrations found for this student in the selected semester"
      );
    }

    let semesterCreditSum = 0;
    let semesterWeightedPoints = 0;
    let earnedCredits = 0;

    for (const registration of registrations) {
      if (registration.status === RegistrationStatus.Withdrawn) continue;

      const course = registration.scheduleSlotContext?.slot.course;
      if (!course) {
        throw new NotFoundError(
          "Course details are missing from one or more course registrations"
        );
      }

      const grades = registration.grades ?? [];
      if (grades.length === 0) {
        throw new BadRequestError(`No grades found for course ${course.code}`);
      }

      const rawScore = CalculateRawScore(grades);
      let finalScore = ApplyRegulationRules(rawScore, regulation ?? undefined);
      finalScore = ApplyMercyRules(finalScore, regulation ?? undefined);

      const finalAssessmentScore = CalculateFinalAssessmentScore(grades);
      const failedCourse = IsFailedCourse(finalScore, finalAssessmentScore, course);

      const definition = FindTranscriptDefinition(finalScore, definitions);
      if (!definition && !failedCourse) {
        throw new NotFoundError(
          `No matching transcript definition was found for course ${course.code} score ${finalScore}`
        );
      }

      const gradeLetter = failedCourse
        ? GradeEnum.F
        : (definition?.gradeLetter as GradeEnum);
      const gradePoints = failedCourse ? 0 : GetGradePointsFromDefinition(definition!);
      const status = failedCourse ? RegistrationStatus.Failed : RegistrationStatus.Completed;

      await transcriptRepository.updateCourseRegistrationGrade(registration.id, {
        grade: gradeLetter,
        gradePoints,
        status,
      });

      const credits = course.credits;
      semesterCreditSum += credits;
      semesterWeightedPoints += gradePoints * credits;
      if (!failedCourse) earnedCredits += credits;
    }

    const semesterGpa =
      semesterCreditSum === 0
        ? 0
        : Number((semesterWeightedPoints / semesterCreditSum).toFixed(4));

    const completedRegistrations =
      await transcriptRepository.getCompletedCourseRegistrations(studentId);

    const cumulativeTotals = completedRegistrations.reduce(
      (acc, registration) => {
        const course = registration.scheduleSlotContext?.slot.course;
        if (!course) return acc;
        return {
          credits: acc.credits + course.credits,
          points:
            acc.points + Number(registration.gradePoints ?? 0) * course.credits,
        };
      },
      { credits: 0, points: 0 }
    );

    const cumulativeGpa =
      cumulativeTotals.credits === 0
        ? 0
        : Number((cumulativeTotals.points / cumulativeTotals.credits).toFixed(4));

    const transcript = await TranscriptRepository.SaveGeneratedTranscript(
      {
        studentId,
        semesterId,
        year: semester.year,
        semesterGpa,
        cumulativeGpa,
        totalCredits: earnedCredits,
      },
      tx
    );

    return transcript;
  });
}


export class TranscriptService {
  public static async QueueFacultySemesterTranscripts(
    semesterId: number,
    facultyId: number,
    schemaName: string
  ): Promise<TranscriptBatchGenerationSummaryDto> {
    return TranscriptRepository.WithTenantClient(schemaName, async (prisma) => {
      const [semester, studentRecords] = await Promise.all([
        TranscriptRepository.GetSemesterById(semesterId, prisma),
        TranscriptRepository.GetStudentIdsForSemesterAndFaculty(
          semesterId,
          facultyId,
          prisma
        ),
      ]);

      if (!semester) {
        throw new NotFoundError("Semester not found");
      }

      if (!studentRecords || studentRecords.length === 0) {
        throw new NotFoundError(
          "No students found for the selected faculty and semester"
        );
      }

      const studentIds = studentRecords.map((s) => s.studentId);

      // single batch job (one queue message)
      const jobId = await JobRepository.CreateTranscriptJobRecord(facultyId, semesterId, prisma);

      await QueueTranscriptGenerationJob({
        jobId,
        facultyId,
        semesterId,
        schemaName,
      });

      return {
        totalStudents: studentIds.length,
        jobId,
      };
    });
  }

  public static async GetFacultySemesterStudentIds(
    semesterId: number,
    facultyId: number,
    schemaName: string
  ) {
    return TranscriptRepository.WithTenantClient(schemaName, async (prisma) => {
      const [semester, studentRecords] = await Promise.all([
        TranscriptRepository.GetSemesterById(semesterId, prisma),
        TranscriptRepository.GetStudentIdsForSemesterAndFaculty(
          semesterId,
          facultyId,
          prisma
        ),
      ]);

      if (!semester) {
        throw new NotFoundError("Semester not found");
      }

      if (!studentRecords || studentRecords.length === 0) {
        throw new NotFoundError(
          "No students found for the selected faculty and semester"
        );
      }

      return studentRecords.map((s) => s.studentId);
    });
  }

  public static async GenerateStudentTranscript(studentId: number, semesterId: number, schemaName: string) {
    const prisma = GetTenantClient(schemaName);
    const transcript = await GenerateStudentTranscript(studentId, semesterId, prisma);
    return MapTranscriptWithCourses(transcript, prisma);
  }

  public static async GenerateStudentTranscriptsForAllSemesters(
    studentId: number,
    schemaName: string
  ): Promise<StudentTranscriptSemestersDto> {
    const semesterRecords =
      await TranscriptRepository.GetStudentSemesterIdsForTenant(
        schemaName,
        studentId
      );

    if (!semesterRecords || semesterRecords.length === 0) {
      throw new NotFoundError(
        "No course registrations found for this student"
      );
    }

    const semesters: TranscriptDto[] = [];
    for (const { semesterId } of semesterRecords) {
      semesters.push(
        await this.GenerateStudentTranscript(studentId, semesterId, schemaName)
      );
    }

    return {
      studentId,
      semesters,
    };
  }

  public static async GetStudentTranscripts(
    studentId: number,
    schemaName: string
  ): Promise<StudentTranscriptSemestersDto> {
    return TranscriptRepository.WithTenantClient(schemaName, async (prisma) => {
      const transcripts = await TranscriptRepository.GetStudentTranscripts(studentId, prisma);
      const semesters = await Promise.all(
        transcripts.map((transcript) => MapTranscriptWithCourses(transcript, prisma))
      );

      return {
        studentId,
        semesters,
      };
    });
  }

  public static async GetStudentSemesterTranscript(
    studentId: number,
    semesterId: number,
    schemaName: string
  ) {
    const transcript = await TranscriptRepository.WithTenantClient(schemaName, (prisma) =>
      TranscriptRepository.GetStudentSemesterTranscript(studentId, semesterId, prisma)
    );
    if (!transcript) {
      throw new NotFoundError("Transcript not found for the selected student and semester");
    }
    return TranscriptRepository.WithTenantClient(schemaName, (prisma) =>
      MapTranscriptWithCourses(transcript, prisma)
    );
  }
}
