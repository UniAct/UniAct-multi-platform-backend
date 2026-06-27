import { Prisma } from "@prisma/client";

const UNIQUE_FIELD_MESSAGES: Record<string, (row: Record<string, any>) => string> = {
  username: (row) => `Username '${row.username}' already exists`,
  email: (row) => `Email '${row.email}' already exists`,
  nationalId: (row) => `National ID '${row.nationalId}' is already registered`,
  national_id: (row) => `National ID '${row.nationalId}' is already registered`,
  universityStudentId: (row) => `University Student ID '${row.universityStudentId}' is already registered`,
  university_student_id: (row) => `University Student ID '${row.universityStudentId}' is already registered`,
};

function extractUniqueFields(err: Prisma.PrismaClientKnownRequestError): string[] {
  const target = err.meta?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];

  const constraintFields = (err.meta?.driverAdapterError as any)?.cause?.constraint?.fields;
  if (Array.isArray(constraintFields)) return constraintFields.map(String);

  const constraintName = String(
    (err.meta?.driverAdapterError as any)?.cause?.constraint?.name ??
    (err.meta?.driverAdapterError as any)?.cause?.constraint ??
    ""
  );

  return Object.keys(UNIQUE_FIELD_MESSAGES).filter((field) => constraintName.includes(field));
}

/**
 * Translates a Prisma (or other DB) error into a human-readable message
 * that can be stored in the job's error log.
 */
export function ResolveDbError(err: any, row: Record<string, any>): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const messages = extractUniqueFields(err)
        .map((field) => UNIQUE_FIELD_MESSAGES[field]?.(row))
        .filter((message): message is string => Boolean(message));

      if (messages.length > 0) return messages.join("; ");

      return "Duplicate value on a unique field";
    }

    if (err.code === "P2003") return "Invalid program or program level - the selected program or program level does not exist";
    if (err.code === "P2025") return "Invalid program or program level - record not found";
  }

  if (err.name === "NotFoundError" || err.message?.includes("No fee Assigned")) {
    return "No fee assigned for the selected program level and semester";
  }

  return err.message ?? "Unknown database error";
}
