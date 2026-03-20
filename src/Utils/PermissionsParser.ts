import { PermissionDefinition } from "../Types/Permission";
import rawPermissions from "./Permissions.json";

/**
 * Type guard that validates a single permission entry.
 *
 * A valid permission must have:
 * - `name`        — a non-empty string matching the "resource.action" format
 * - `description` — a non-empty string
 *
 * @param value - The unknown value to validate
 * @returns `true` if the value is a valid {@link PermissionDefinition}
 */
function IsValidPermission(value: unknown): value is PermissionDefinition {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.name === "string" &&
    /^[a-zA-Z_]+\.[a-zA-Z_]+$/.test(obj.name) &&
    typeof obj.description === "string" &&
    obj.description.trim().length > 0
  );
}

/**
 * Parses and validates the raw permissions JSON into a flat list of {@link PermissionDefinition}.
 *
 * Expects the JSON to follow this structure:
 * ```json
 * {
 *   "resource": {
 *     "action": { "name": "resource.action", "description": "..." }
 *   }
 * }
 * ```
 *
 * Iterates over each resource group and its actions, validates every entry,
 * and flattens the result into a single array — ready for database seeding.
 *
 * @param json - The raw parsed JSON (typed as `unknown` for safe validation)
 * @returns A flat array of validated {@link PermissionDefinition} objects
 * @throws {Error} If the root value is not a plain object
 * @throws {Error} If any resource group is not a plain object
 * @throws {Error} If any permission entry fails validation
 */
function ParsePermissions(json: unknown): PermissionDefinition[] {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error("Permissions JSON must be a plain object");
  }

  const result: PermissionDefinition[] = [];

  for (const [resource, actions] of Object.entries(json as Record<string, unknown>)) {
    if (typeof actions !== "object" || actions === null || Array.isArray(actions)) {
      throw new Error(`Resource "${resource}" must be a plain object`);
    }

    for (const [action, perm] of Object.entries(actions as Record<string, unknown>)) {
      if (!IsValidPermission(perm)) {
        throw new Error(`Invalid permission at "${resource}.${action}"`);
      }

      result.push({ name: perm.name, description: perm.description });
    }
  }

  return result;
}

/**
 * The full list of system permissions, parsed and validated from `Permissions.json`.
 * Used for seeding the database with default permissions on initial setup.
 */
const Permissions = ParsePermissions(rawPermissions);

export default Permissions;