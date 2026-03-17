// IMPORTANT: Any sensitive information must be masked before logging.
// For example, use utilities like Masking.MaskEmail to safely log email addresses.
// Other sensitive fields (passwords, tokens, personal IDs) should also be masked
// or redacted using Pino's `redact` option or custom masking functions.
// ex
// logger.info(
//   {
//      email: Masking.MaskEmail(user.email)
//   }
// );


export class Masking {
  /**
   * Masks an email for logging purposes.
   * Example: "john.doe@example.com" -> "jo****@example.com"
   * @param email - the email string to mask
   * @returns masked email string
   */
  public static MaskEmail(email: string | undefined): string {
    if (!email) return "";

    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return "";

    const visibleChars = Math.min(2, localPart.length);
    const maskedPart = "*".repeat(Math.max(localPart.length - visibleChars, 0));

    return `${localPart.slice(0, visibleChars)}${maskedPart}@${domain}`;
  }
}