import { getEmailProvider } from "@/lib/email";

export type SendEmailPayload = {
  to: string | string[];
  subject: string;
  html?: string;
  body?: string;
  text?: string;
};

export type SendEmailResult = {
  success: boolean;
  provider?: string;
  providerId?: string;
  messageId?: string;
  simulated?: boolean;
  error?: string;
};

export interface EmailProvider {
  send(payload: SendEmailPayload): Promise<SendEmailResult>;
}

export async function sendEmail(
  payload: SendEmailPayload
): Promise<SendEmailResult> {
  const provider = getEmailProvider();
  return provider.send(payload);
}
