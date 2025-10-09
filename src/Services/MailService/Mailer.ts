import nodemailer from "nodemailer";
import { EmailTemplate } from "./MailTemplate";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth : {
    user: process.env.APPLICATION_EMIL,
    pass: process.env.APPLICATION_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((err , success) => {
  if(err){
    console.error("Nodemailer verification failed: " , err);
  }
});

export async function SendMail(email : string) {
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
};
