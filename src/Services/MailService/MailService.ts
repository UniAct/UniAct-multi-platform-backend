import { transporter } from "../../Utils/EmailTransporter";
import { EmailTemplate } from "./MailTemplate";
import dotenv from 'dotenv';
dotenv.config();

export class MailService {
  private static async SendMail(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: `UniAct <${process.env.APPLICATION_EMAIL}>`,
        to,
        subject,
        text: "Please click the link to verify your email",
        html,
      });
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  }

  public static async SendVerificationSuperAdminMail(email: string) {
    const html = EmailTemplate.SuperAdminTemplate(email);
    await this.SendMail(email, "Verify Your Email", html);
  }

  public static async SendVerificationRootAccountMail(
    email: string,
    university_name: string
  ) {
    const html = EmailTemplate.RootAccountTemplate(email, university_name);
    await this.SendMail(email, "Verify Your Email", html);
  }

  public static async SendVerificationStaffAccountMail(
    email: string,
    university_name: string
  ) {
    const html = EmailTemplate.StaffAccountTemplate(email, university_name);
    await this.SendMail(email, "Verify Your Staff Account", html);
  }
}
