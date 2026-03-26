import { BlockReasonType, Prisma, ProgramType, ResultDisplayType, SemesterType } from "@prisma/client";
import {
  ProgramFeeInput,
  ProgramLevelInput,
  ProgramUpsertInput,
} from "../Interfaces/AcademicProgram";
import { ProgramRepository } from "../Repositories/ProgramRepository";
import { NotFoundError } from "../Types/Errors";
import { GetTenantClient } from "../Utils/prismaClient";
import { logger } from "../Utils/Logger";

export class programService {
  private static readonly templateYear = 2000;

  private static readonly semesterTemplates: Array<{
    term: number;
    type: SemesterType;
    startDate: Date;
    endDate: Date;
  }> = [
      {
        term: 1,
        type: "Fall",
        startDate: new Date("2000-09-01"),
        endDate: new Date("2001-01-15"),
      },
      {
        term: 2,
        type: "Spring",
        startDate: new Date("2001-02-01"),
        endDate: new Date("2001-06-15"),
      },
      {
        term: 3,
        type: "Summer",
        startDate: new Date("2001-07-01"),
        endDate: new Date("2001-08-31"),
      },
    ];

  private static normalizeProgramPayload(payload: ProgramUpsertInput): ProgramUpsertInput {
    return {
      ...payload,
      programType: payload.programType as ProgramType,
      resultDisplay: (payload.resultDisplay ?? "CourseGrade") as ResultDisplayType,
      blockReason: payload.blockReason as BlockReasonType | undefined,
      levels: payload.levels ?? [],
      transcriptDefinition: payload.transcriptDefinition ?? [],
      academicLoadSemester: payload.academicLoadSemester ?? [],
      academicLoadGPA: payload.academicLoadGPA ?? [],
    };
  }

  private static async ensureTemplateSemesters(tx: Prisma.TransactionClient) {
    const semesters = await Promise.all(
      this.semesterTemplates.map((template) =>
        tx.semester.upsert({
          where: {
            year_term: {
              year: this.templateYear,
              term: template.term,
            },
          },
          update: {
            type: template.type,
          },
          create: {
            year: this.templateYear,
            term: template.term,
            type: template.type,
            startDate: template.startDate,
            endDate: template.endDate,
          },
        }),
      ),
    );

    return new Map(semesters.map((semester) => [semester.term, semester]));
  }

  private static buildBaseProgramData(payload: ProgramUpsertInput): Prisma.ProgramCreateInput {
    return {
      name: payload.name,
      description: payload.description,
      phone: payload.phone,
      universityCreditHours: payload.universityCreditHours ?? 0,
      facultyCreditHours: payload.facultyCreditHours ?? 0,
      programCreditHours: payload.programCreditHours ?? 0,
      programType: payload.programType,
      resultDisplay: payload.resultDisplay ?? "CourseGrade",
      blockReason: payload.blockReason,
      faculty: {
        connect: { id: payload.facultyId },
      },
      head: payload.headId
        ? {
          connect: { userId: payload.headId },
        }
        : undefined,
    };
  }

  private static buildBaseProgramUpdateData(payload: ProgramUpsertInput): Prisma.ProgramUpdateInput {
    return {
      name: payload.name,
      description: payload.description,
      phone: payload.phone,
      universityCreditHours: payload.universityCreditHours ?? 0,
      facultyCreditHours: payload.facultyCreditHours ?? 0,
      programCreditHours: payload.programCreditHours ?? 0,
      programType: payload.programType,
      resultDisplay: payload.resultDisplay ?? "CourseGrade",
      blockReason: payload.blockReason,
      faculty: {
        connect: { id: payload.facultyId },
      },
      head: payload.headId
        ? {
          connect: { userId: payload.headId },
        }
        : {
          disconnect: true,
        },
    };
  }

  private static collectFees(level: ProgramLevelInput): ProgramFeeInput[] {
    const regularFees = level.fees ?? [];
    const semester1Fees = (level.semesterFees?.semester1 ?? []).map((fee) => ({
      ...fee,
      semesterNumber: 1,
    }));
    const semester2Fees = (level.semesterFees?.semester2 ?? []).map((fee) => ({
      ...fee,
      semesterNumber: 2,
    }));
    const summerFees = (level.summerFees ?? []).map((fee) => ({
      ...fee,
      semesterNumber: fee.semesterNumber ?? 3,
    }));

    return [...regularFees, ...semester1Fees, ...semester2Fees, ...summerFees];
  }

  private static async createProgramConfiguration(
    tx: Prisma.TransactionClient,
    programId: number,
    payload: ProgramUpsertInput,
  ) {
    const semesterMap = await this.ensureTemplateSemesters(tx);

    const createdLevels = await Promise.all(
      (payload.levels ?? []).map((level) =>
        tx.programLevel.create({
          data: {
            program: { connect: { id: programId } },
            level: level.level,
            minCredits: level.minCredits,
            maxCredits: level.maxCredits,
          },
        }),
      ),
    );

    const levelMap = new Map(createdLevels.map((level) => [level.level, level]));

    const feeRows: Prisma.FeeCreateManyInput[] = [];
    for (const level of payload.levels ?? []) {
      const createdLevel = levelMap.get(level.level);
      if (!createdLevel) continue;

      const fees = this.collectFees(level);
      for (const fee of fees) {
        const semesterId =
          fee.semesterNumber !== undefined ? semesterMap.get(fee.semesterNumber)?.id : undefined;

        feeRows.push({
          programLevelId: createdLevel.id,
          semesterId: semesterId!,
          feeType: fee.feeType,
          amount: fee.amount,
          description: fee.description,
        });
      }
    }

    if (feeRows.length > 0) {
      await tx.fee.createMany({ data: feeRows });
    }

    const transcriptRows: Prisma.ProgramTranscriptDefinitionCreateManyInput[] =
      (payload.transcriptDefinition ?? []).map((definition) => ({
        programId,
        gradeLetter: definition.gradeLetter,
        minScore: definition.minScore,
        maxScore: definition.maxScore,
        minGpa: definition.minGPA,
        maxGpa: definition.maxGPA,
        equivalentEstimate: definition.equivalentEstimate,
      }));

    if (transcriptRows.length > 0) {
      await tx.programTranscriptDefinition.createMany({ data: transcriptRows });
    }

    const gpaRows: Prisma.AcademicLoadGPACreateManyInput[] =
      (payload.academicLoadGPA ?? []).map((load) => ({
        programId,
        minGpa: load.minGPA,
        maxGpa: load.maxGPA,
        minCredits: load.minCredits,
        maxCredits: load.maxCredits,
      }));

    if (gpaRows.length > 0) {
      await tx.academicLoadGPA.createMany({ data: gpaRows });
    }

    const semesterLoadRows: Prisma.AcademicLoadSemesterCreateManyInput[] = [];
    for (const load of payload.academicLoadSemester ?? []) {
      const programLevel = levelMap.get(load.level);
      const semester = semesterMap.get(load.semester);

      if (!programLevel || !semester) continue;

      semesterLoadRows.push({
        programId,
        semesterId: semester.id,
        programLevelId: programLevel.id,
        minCredits: load.minCredits,
        maxCredits: load.maxCredits,
      });
    }

    if (semesterLoadRows.length > 0) {
      await tx.academicLoadSemester.createMany({ data: semesterLoadRows });
    }
  }

  static async CreateProgram(programData: ProgramUpsertInput, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    const payload = this.normalizeProgramPayload(programData);

    const newProgram = await prisma.$transaction(async (tx) => {
      const createdProgram = await ProgramRepository.CreateProgram(
        this.buildBaseProgramData(payload),
        tx,
      );

      await this.createProgramConfiguration(tx, createdProgram.id, payload);

      return ProgramRepository.GetProgramById(createdProgram.id, tx);
    }, { maxWait: 10000, timeout: 30000 });

    if (!newProgram) {
      throw new Error("Program creation failed");
    }

    logger.info({
      action: "programService.CreateProgram",
      status: "success",
      program_name: newProgram.name,
      schema: schema_name,
    });
    return newProgram;
  }

  static async GetAllPrograms(schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    return ProgramRepository.GetAllPrograms(prisma);
  }

  static async GetProgramById(id: number, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    const program = await ProgramRepository.GetProgramById(id, prisma);

    if (!program) {
      throw new NotFoundError("This program doesn't exist");
    }
    return program;
  }

  static async UpdateProgram(id: number, programData: ProgramUpsertInput, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    const payload = this.normalizeProgramPayload(programData);

    const updatedProgram = await prisma.$transaction(async (tx) => {
      const existing = await ProgramRepository.GetProgramById(id, tx);
      if (!existing) {
        throw new NotFoundError("This program doesn't exist");
      }

      await tx.academicLoadSemester.deleteMany({ where: { programId: id } });
      await tx.academicLoadGPA.deleteMany({ where: { programId: id } });
      await tx.programTranscriptDefinition.deleteMany({ where: { programId: id } });

      const levelIds = existing.programLevels.map((level) => level.id);
      if (levelIds.length > 0) {
        await tx.fee.deleteMany({ where: { programLevelId: { in: levelIds } } });
      }
      await tx.programLevel.deleteMany({ where: { programId: id } });

      await ProgramRepository.UpdateProgram(id, this.buildBaseProgramUpdateData(payload), tx);
      await this.createProgramConfiguration(tx, id, payload);

      return ProgramRepository.GetProgramById(id, tx);
    }, { maxWait: 10000, timeout: 30000 });

    if (!updatedProgram) {
      throw new Error("Program update failed");
    }

    return updatedProgram;
  }

  static async DeleteProgramById(id: number, schema_name: string) {
    const prisma = GetTenantClient(schema_name);
    await ProgramRepository.DeleteProgramById(id, prisma);
  }
}
