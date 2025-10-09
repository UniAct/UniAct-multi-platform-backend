/**
 * Validates a password against the system’s security policy.
 *
 * The password policy enforces the following rules:
 * - Must be between 8 and 64 characters long.
 * - Must contain **at least 2 uppercase letters** (A–Z).
 * - Must contain **at least 2 lowercase letters** (a–z).
 * - Must contain **at least 2 digits** (0–9).
 * - Must contain **at least 2 special characters** (any non-alphanumeric character).
 */
export function ValidatePassword(password: string): string | null {
  const uppercase = (password.match(/[A-Z]/g) || []).length;
  const lowercase = (password.match(/[a-z]/g) || []).length;
  const digits = (password.match(/[0-9]/g) || []).length;
  const special = (password.match(/[^A-Za-z0-9]/g) || []).length;

  if (password.length < 8)
    return "Password must be at least 8 characters long";

  if (password.length > 64)
    return "Password must not exceed 64 characters";

  if (uppercase < 2)
    return "Password must contain at least 2 uppercase letters";

  if (lowercase < 2)
    return "Password must contain at least 2 lowercase letters";

  if (digits < 2)
    return "Password must contain at least 2 digits";

  if (special < 2)
    return "Password must contain at least 2 special characters";

  return null;
}
