import { CourseAssessmentType, GradeEnum, RegistrationStatus } from "@prisma/client";
import { GetTenantClient } from "../Utils/prismaClient";
import { TranscriptRepository } from "../Repositories/TranscriptRepository";
import { BadRequestError, NotFoundError } from "../Types/Errors";
import {
  TranscriptGenerationSummaryDto,
  TranscriptBatchGenerationSummaryDto,
  TranscriptJobQueuedDto,
} from "../Interfaces/Transcript/TranscriptDto";
import { QueueRepository } from "../Repositories/QueueRepository";
import { Queues } from "../Enums/Queues";
import { TranscriptJobMessage } from "../Interfaces/Transcript/TranscriptJobMessage";

 
// grading rules
type TranscriptDefinition = {
  minScore: any;
  maxScore: any;
  gradeLetter: any;
  minGpa: any;
  maxGpa: any;
};


// helper functions to calculate scores, apply regulations, and determine pass/fail status  
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
  gradePoints: any;
  scheduleSlotContext: {
    slot: {
      course: {
        credits: number;
      };
    };
  } | null;
};

export class TranscriptService {
  private static async QueueStudentTranscriptJob(
    studentId: number,
    semesterId: number,
    schemaName: string
  ) {
    const payload: TranscriptJobMessage = {
      studentId,
      semesterId,
      schemaName,
    };

    return QueueRepository.Publish<TranscriptJobMessage>(
      Queues.TranscriptGeneration,
      payload
    );
  }

  private static calculateRawScore(grades: Array<{ marks: any; maxMarks: any }>) {
    const totalMarks = grades.reduce((sum, grade) => sum + Number(grade.marks), 0);
    const totalMaxMarks = grades.reduce((sum, grade) => sum + Number(grade.maxMarks), 0);

    if (totalMaxMarks === 0) {
      return 0;
    }

    return (totalMarks / totalMaxMarks) * 100;
  }

  private static applyRegulationRules(
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

  private static applyMercyRules(
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

  private static findTranscriptDefinition(score: number, definitions: TranscriptDefinition[]) {
    return definitions.find((definition) => {
      const minScore = Number(definition.minScore);
      const maxScore = Number(definition.maxScore);
      return score >= minScore && score <= maxScore;
    });
  }

  private static getGradePointsFromDefinition(definition: { minGpa: any; maxGpa: any }) {
    const minGpa = Number(definition.minGpa);
    const maxGpa = Number(definition.maxGpa);
    return Number(((minGpa + maxGpa) / 2).toFixed(4));
  }

  private static calculateFinalAssessmentScore(grades: CourseRegistrationWithRelations["grades"]) {
    const finalGrades = grades.filter((grade) => {
      return grade.courseAssessment.assessmentType === CourseAssessmentType.Final;
    });

    if (finalGrades.length === 0) {
      return null;
    }

    return TranscriptService.calculateRawScore(finalGrades);
  }

  private static isFailedCourse(
    totalScore: number,
    finalAssessmentScore: number | null,
    course: TranscriptCourse
  ) {
    const successPercentage = course.successPercentage !== null && course.successPercentage !== undefined
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

  public static async GenerateStudentTranscript(
    studentId: number,
    semesterId: number,
    schemaName: string
  ) {
    const prisma = GetTenantClient(schemaName);

    return prisma.$transaction(async (tx) => {
      const student = await TranscriptRepository.GetStudentById(studentId, tx);
      if (!student) {
        throw new NotFoundError("Student not found");
      }

      const semester = await TranscriptRepository.GetSemesterById(semesterId, tx);
      if (!semester) {
        throw new NotFoundError("Semester not found");
      }

      const program = await tx.program.findUnique({
        where: { id: student.programId },
        select: { id: true, facultyId: true },
      });

      if (!program) {
        throw new NotFoundError("Program not found for the student");
      }

      const regulation = await TranscriptRepository.GetFacultyRegulationWithMercyRules(program.facultyId, tx);
      const definitions = await TranscriptRepository.GetProgramTranscriptDefinitions(program.id, tx) as TranscriptDefinition[];

      if (!definitions || definitions.length === 0) {
        throw new NotFoundError("Program transcript grade definitions are not configured");
      }

      const registrations = await TranscriptRepository.GetCourseRegistrationsForSemester(
        studentId,
        semesterId,
        tx
      ) as CourseRegistrationWithRelations[];
      if (!registrations || registrations.length === 0) {
        throw new NotFoundError("No course registrations found for this student in the selected semester");
      }

      let semesterCreditSum = 0;
      let semesterWeightedPoints = 0;
      let earnedCredits = 0;

      for (const registration of registrations) {
        if (registration.status === RegistrationStatus.Withdrawn) {
          continue;
        }

        const course = registration.scheduleSlotContext?.slot.course;
        if (!course) {
          throw new NotFoundError("Course details are missing from one or more course registrations");
        }

        const grades = registration.grades ?? [];
        if (grades.length === 0) {
          throw new BadRequestError(`No grades found for course ${course.code}`);
        }

        const rawScore = TranscriptService.calculateRawScore(grades);
        let finalScore = TranscriptService.applyRegulationRules(rawScore, regulation ?? undefined);
        finalScore = TranscriptService.applyMercyRules(finalScore, regulation ?? undefined);

        const finalAssessmentScore = TranscriptService.calculateFinalAssessmentScore(grades);
        const failedCourse = TranscriptService.isFailedCourse(finalScore, finalAssessmentScore, course);

        const definition = TranscriptService.findTranscriptDefinition(finalScore, definitions);
        if (!definition && !failedCourse) {
          throw new NotFoundError(`No matching transcript definition was found for course ${course.code} score ${finalScore}`);
        }

        const gradeLetter = failedCourse ? GradeEnum.F : (definition?.gradeLetter as GradeEnum);
        const gradePoints = failedCourse ? 0 : TranscriptService.getGradePointsFromDefinition(definition!);
        const status = failedCourse ? RegistrationStatus.Failed : RegistrationStatus.Completed;

        const updatedRegistration = await TranscriptRepository.UpdateCourseRegistrationGrade(
          registration.id,
          {
            grade: gradeLetter,
            gradePoints,
            status,
          },
          tx
        );

        const credits = course.credits;
        semesterCreditSum += credits;
        semesterWeightedPoints += gradePoints * credits;

        if (!failedCourse) {
          earnedCredits += credits;
        }
      }

      const semesterGpa = semesterCreditSum === 0 ? 0 : Number((semesterWeightedPoints / semesterCreditSum).toFixed(4));

      const completedRegistrations = await TranscriptRepository.GetCompletedCourseRegistrations(studentId, tx) as CompletedCourseRegistrationWithRelations[];
      const cumulativeTotals = completedRegistrations.reduce(
        (acc, registration) => {
          const course = registration.scheduleSlotContext?.slot.course;
          if (!course) {
            return acc;
          }

          return {
            credits: acc.credits + course.credits,
            points: acc.points + (Number(registration.gradePoints ?? 0) * course.credits),
          };
        },
        { credits: 0, points: 0 }
      );

      const cumulativeGpa = cumulativeTotals.credits === 0 ? 0 : Number((cumulativeTotals.points / cumulativeTotals.credits).toFixed(4));

      const transcript = await TranscriptRepository.UpsertTranscript(
        studentId,
        semesterId,
        semester.year,
        semesterGpa,
        cumulativeGpa,
        earnedCredits,
        tx
      );

      await tx.student.update({
        where: { userId: studentId },
        data: { cgpa: cumulativeGpa },
      });

      return transcript;
    });
  }

  public static async QueueStudentTranscript(
    studentId: number,
    semesterId: number,
    schemaName: string
  ): Promise<TranscriptJobQueuedDto> {
    const prisma = GetTenantClient(schemaName);

    const [student, semester] = await Promise.all([
      TranscriptRepository.GetStudentById(studentId, prisma),
      TranscriptRepository.GetSemesterById(semesterId, prisma),
    ]);

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    if (!semester) {
      throw new NotFoundError("Semester not found");
    }

    const registrationCount = await TranscriptRepository.CountCourseRegistrationsForSemester(
      studentId,
      semesterId,
      prisma
    );

    if (registrationCount === 0) {
      throw new NotFoundError("No course registrations found for this student in the selected semester");
    }

    const jobId = await TranscriptService.QueueStudentTranscriptJob(
      studentId,
      semesterId,
      schemaName
    );

    return {
      studentId,
      semesterId,
      jobId,
    };
  }

  public static async GenerateSemesterTranscripts(
    semesterId: number,
    schemaName: string
  ): Promise<TranscriptGenerationSummaryDto> {
    const prisma = GetTenantClient(schemaName);
    const studentIds = await TranscriptRepository.GetStudentIdsForSemester(semesterId, prisma);

    if (!studentIds || studentIds.length === 0) {
      throw new NotFoundError("No students found for the selected semester");
    }

    const queuedJobs: Array<{ studentId: number; jobId: string }> = [];
    for (const record of studentIds) {
      const jobId = await TranscriptService.QueueStudentTranscriptJob(
        record.studentId,
        semesterId,
        schemaName
      );

      queuedJobs.push({ studentId: record.studentId, jobId });
    }

    return {
      semesterId,
      totalStudents: studentIds.length,
      queuedCount: queuedJobs.length,
      queuedJobs,
    };
  }

  public static async GenerateFacultySemesterTranscripts(
    semesterId: number,
    facultyId: number,
    schemaName: string
  ): Promise<TranscriptBatchGenerationSummaryDto> {
    const prisma = GetTenantClient(schemaName);
    const studentIds = await TranscriptRepository.GetStudentIdsForSemesterAndFaculty(
      semesterId,
      facultyId,
      prisma
    );

    if (!studentIds || studentIds.length === 0) {
      throw new NotFoundError("No students found for the selected faculty and semester");
    }

    const queuedJobs: Array<{ studentId: number; jobId: string; level: number }> = [];
    const levelCounts = new Map<number, number>();

    for (const record of studentIds) {
      const level = record.student.programLevel.level;
      levelCounts.set(level, (levelCounts.get(level) ?? 0) + 1);

      const jobId = await TranscriptService.QueueStudentTranscriptJob(
        record.studentId,
        semesterId,
        schemaName
      );

      queuedJobs.push({ studentId: record.studentId, jobId, level });
    }

    return {
      semesterId,
      facultyId,
      totalStudents: studentIds.length,
      queuedCount: queuedJobs.length,
      levelBreakdown: Array.from(levelCounts.entries())
        .sort(([left], [right]) => left - right)
        .map(([level, totalStudents]) => ({ level, totalStudents })),
      queuedJobs,
    };
  }

  public static async GetStudentTranscripts(studentId: number, schemaName: string) {
    const prisma = GetTenantClient(schemaName);
    return TranscriptRepository.GetStudentTranscripts(studentId, prisma);
  }

  public static async GetStudentSemesterTranscript(
    studentId: number,
    semesterId: number,
    schemaName: string
  ) {
    const prisma = GetTenantClient(schemaName);
    const transcript = await TranscriptRepository.GetStudentSemesterTranscript(studentId, semesterId, prisma);
    if (!transcript) {
      throw new NotFoundError("Transcript not found for the selected student and semester");
    }
    return transcript;
  }
}
