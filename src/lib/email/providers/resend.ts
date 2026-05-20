import { Resend } from "resend";

import type {
  EmailProvider,
  SendEmailPayload,
  SendEmailResult,
} from "../provider";

const resend = new Resend(process.env.RESEND_API_KEY);

function shouldSimulateEmail() {
  return process.env.EMAIL_MODE === "simulation";
}

export class ResendProvider implements EmailProvider {
  async send(payload: SendEmailPayload): Promise<SendEmailResult> {
    const html = payload.html || payload.body || "";
    const text = payload.text || html.replace(/<[^>]*>/g, "");

    if (shouldSimulateEmail()) {
      const simulatedId = `sim_${Date.now()}`;

      return {
        success: true,
        provider: "simulation",
        providerId: simulatedId,
        messageId: simulatedId,
        simulated: true,
      };
    }

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
