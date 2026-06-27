// src/repositories/EnrollmentWindowRepository.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { CreateEnrollmentWindowInput, UpdateEnrollmentWindowInput } from "../Interfaces/Enrollment-Window/EnrollmentWindow";


// A robust type definition that accommodates both standard client operations and transactional runners
type DbClient = PrismaClient | Prisma.TransactionClient;


export class EnrollmentWindowRepository {

  // 1. Persist a new enrollment window to the tenant database
  static async CreateEnrollmentWindow(windowData: CreateEnrollmentWindowInput, prisma: DbClient) {
    return await prisma.enrollmentWindow.create({
      data: {
        name: windowData.name,
        facultyId: windowData.facultyId,
        programId: windowData.programId,
        semesterId: windowData.semesterId,
        programLevelId: windowData.programLevelId,
        startTime: windowData.startTime,
        endTime: windowData.endTime,
        isActive: windowData.isActive,
      },
    });
  }

  
  static async GetEnrollmentWindowById(id: number, prisma: DbClient) {
    return await prisma.enrollmentWindow.findUnique({
      where: { id },
    });
  }

  // 3. Update execution block
  static async UpdateEnrollmentWindow( id: number, windowData: UpdateEnrollmentWindowInput, prisma: DbClient) {
    try {
      return await prisma.enrollmentWindow.update({
        where: { id },
        data: windowData,
      });
    } catch (error) {
      // Prisma error code for target record not found during update operations
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 4. Safe deletion block
  static async DeleteEnrollmentWindow(
    id: number, 
    prisma: DbClient
  ) {
    try {
      return await prisma.enrollmentWindow.delete({
        where: { id },
      });
    } catch (error) {
      // Prisma error code for target record not found during delete operations
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // --- NEW: FALLBACK LOOKUP METHOD ---
  /**
   * Finds an active enrollment window based on student criteria.
   * Prioritizes program-specific rules, falling back to faculty-wide rules if needed.
   */
  static async FindActiveWindow(
criteria: {
      facultyId: number;
      semesterId: number;
      programLevelId: number;
      programId?: number | null;
    },
    prisma: DbClient
  ) {
    const currentTime = new Date();
    const { facultyId, semesterId, programLevelId, programId } = criteria;

    // Base fallback condition: Always match faculty-wide rules where programId is NULL
    const targetProgramConditions: Prisma.EnrollmentWindowWhereInput[] = [
      { programId: null }
    ];

    // If the student payload passes a specific program, add it to the top of our matching targets
    if (programId) {
      targetProgramConditions.unshift({ programId: programId });
    }

    const activeWindows = await prisma.enrollmentWindow.findMany({
      where: {
        facultyId,
        semesterId,
        programLevelId,
        isActive: true,
        startTime: { lte: currentTime }, // Window has started
        endTime: { gte: currentTime },   // Window hasn't closed yet
        OR: targetProgramConditions,     // Matches [Specific Program] OR [Faculty-Wide Null]
      },

      // Crucial: Sorting by programId DESC places numerical IDs first and NULL values last.
      // This ensures that if BOTH a specific and a faculty-wide rule match, the specific one takes priority.
      orderBy: [
        { programId: 'desc' },
        { createdAt: 'desc' }
      ],
      
      take: 1, // We only care about the single highest-priority matching window
    });

    return activeWindows[0] || null;
  }


}