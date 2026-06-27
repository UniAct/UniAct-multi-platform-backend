import { BrevoClient } from "@getbrevo/brevo";
import { logger } from "./Logger";

interface SendEmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const BREVO_SENDER = {
  name: "UniAct System",
  email: "uniact.notification@gmail.com",
};

let brevoClient: BrevoClient | undefined;

function getBrevoClient(): BrevoClient {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY must be set to send verification emails");
  }

  if (!brevoClient) {
    brevoClient = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
      timeoutInSeconds: 30,
      maxRetries: 2,
    });
  }

  return brevoClient;
}

export async function SendEmail(payload: SendEmailPayload): Promise<void> {
  try {
    const result = await getBrevoClient().transactionalEmails.sendTransacEmail({
      sender: BREVO_SENDER,
      to: [{ email: payload.to }],
      subject: payload.subject,
      textContent: payload.text,
      htmlContent: payload.html,
    });

    logger.info({
      action: "EmailClient.SendEmail",
      provider: "brevo",
      status: "sent",
      to: payload.to,
      messageId: result.messageId,
    });
  } catch (err: any) {
    const responseBody = err?.body;
    const reason =
      responseBody?.message ||
      responseBody?.code ||
      err?.message ||
      "Unknown Brevo email send failure";

    throw new Error(`Brevo transactional email send failed: ${reason}`);
  }
}
