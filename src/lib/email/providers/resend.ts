import { Resend } from "resend";

import type {
  EmailProvider,
  SendEmailPayload,
  SendEmailResult,
} from "../provider";

const resend = new Resend(process.env.RESEND_API_KEY);

export class ResendProvider implements EmailProvider {
  async send(payload: SendEmailPayload): Promise<SendEmailResult> {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        provider: "resend",
        simulated: false,
        error: "Missing RESEND_API_KEY",
      };
    }

    if (!process.env.EMAIL_FROM) {
      return {
        success: false,
        provider: "resend",
        simulated: false,
        error: "Missing EMAIL_FROM",
      };
    }

    const html = payload.html || payload.body || "";
    const text = payload.text || html.replace(/<[^>]*>/g, "");

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html,
      text,
    });

    if (error) {
      return {
        success: false,
        provider: "resend",
        simulated: false,
        error: error.message,
      };
    }

    return {
      success: true,
      provider: "resend",
      providerId: data?.id,
      messageId: data?.id,
      simulated: false,
    };
  }
}
