import { EmailTemplate } from "./MailTemplate";
import { transporter } from "../../Utils/EmailTransporter";

export class MailService{
  public static async SendVerificationMail(email : string){
    try {
      const info = await transporter.sendMail({
        from: `UniAct <${process.env.APPLICATION_EMAIL}>`,
        to: email,
        subject: "Verify Your Email",
        text: "Please click the link to verify your email",
        html: EmailTemplate(email)
      });
    } catch (err) {
      console.error("Failed to send email: ", err);
    }
  }
}
