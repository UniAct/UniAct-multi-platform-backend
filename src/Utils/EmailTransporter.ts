import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APPLICATION_EMAIL,
    pass: process.env.APPLICATION_PASSWORD,
  },
});
