import { Prisma } from "@prisma/client";
/**
 * Translates a Prisma (or other DB) error into a human-readable message
 * that can be stored in the job's error log.
 */
export function ResolveDbError(err: any, row: Record<string, any>): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      // Unique constraint violation — identify which field caused it.
      const field =
        (err.meta?.target as string[])?.[0] ??
        (err.meta?.driverAdapterError as any)?.cause?.constraint?.fields?.[0];

      if (field === "username")              return `Username '${row.username}' already exists`;
      if (field === "email")                 return `Email '${row.email}' already exists`;
      if (field === "national_id")           return `National ID '${row.nationalId}' is already registered`;
      if (field === "university_student_id") return `University Student ID '${row.universityStudentId}' is already registered`;

      return "Duplicate value on a unique field";
    }

    if (err.code === "P2003") return "Invalid program or program level — the selected program or program level does not exist";
    if (err.code === "P2025") return "Invalid program or program level — record not found";
  }

  if (err.name === "NotFoundError" || err.message?.includes("No fee Assigned")) {
    return "No fee assigned for the selected program level and semester";
  }

  return err.message ?? "Unknown database error";
}