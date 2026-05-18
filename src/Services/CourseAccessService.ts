import { Prisma, PrismaClient } from "@prisma/client";
import { TokenPayload } from "../Interfaces/TokenPayload";
import { RBACRepository } from "../Repositories/RBACRepository";
import { CourseRepository } from "../Repositories/CourseRepository";
import { ForbiddenError } from "../Types/Errors";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class CourseAccessService {
  private static normalizeRole(role: string) {
    return role.trim().toLowerCase().replace(/[\s_-]+/g, "");
  }

  private static isAdminRole(user: TokenPayload) {
    return user.roles?.some((role) => {
      const normalizedRole = this.normalizeRole(role);
      return (
        normalizedRole === "admin" ||
        normalizedRole === "superadmin" ||
        normalizedRole === "root" ||
        normalizedRole === "rootaccount" ||
        normalizedRole === "tenantadmin"
      );
    }) ?? false;
  }

  private static async hasPermission(user: TokenPayload, permission: string, prisma: DbClient) {
    if (user.permissions?.includes(permission)) {
      return true;
    }

    if (!user.id) {
      return false;
    }

    const currentPermissions = await RBACRepository.GetUserPermissions(user.id, prisma as PrismaClient);
    user.permissions = currentPermissions;

    return currentPermissions.includes(permission);
  }

  private static async hasAdminAccess(user: TokenPayload, permission: string, prisma: DbClient) {
    return this.isAdminRole(user) || this.hasPermission(user, permission, prisma);
  }

  public static async HasAdminAccess(user: TokenPayload, prisma: DbClient, adminPermission: string) {
    return this.hasAdminAccess(user, adminPermission, prisma);
  }

  public static async EnsureHasAdminAccess(user: TokenPayload, prisma: DbClient, adminPermission: string) {
    if (!user.id || !(await this.HasAdminAccess(user, prisma, adminPermission))) {
      throw new ForbiddenError("Access denied.");
    }
  }

  public static async EnsureCanAccessCourse(
    user: TokenPayload,
    prisma: DbClient,
    courseId: number,
    semesterId: number | null,
    adminPermission: string,
  ) {
    if (!user.id) {
      throw new ForbiddenError("Access denied.");
    }

    if (await this.HasAdminAccess(user, prisma, adminPermission)) {
      return;
    }

    if (user.isStaff) {
      const isAssigned = await CourseRepository.IsStaffAssignedToCourse(
        user.id,
        courseId,
        semesterId,
        prisma,
      );

      if (isAssigned) {
        return;
      }
    }

    throw new ForbiddenError("You can only access assigned courses.");
  }

  public static async EnsureCanAccessScheduleSlot(
    user: TokenPayload,
    prisma: DbClient,
    scheduleSlotId: number,
    adminPermission: string,
  ) {
    const slot = await CourseRepository.GetScheduleSlotAccessContext(scheduleSlotId, prisma);
    if (!slot) {
      throw new ForbiddenError("Schedule slot is not accessible.");
    }

    await this.EnsureCanAccessCourse(
      user,
      prisma,
      slot.courseId,
      slot.semesterId,
      adminPermission,
    );

    return slot;
  }
}
