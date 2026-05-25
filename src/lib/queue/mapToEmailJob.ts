import type { EmailJob } from "../../types/email";

export function mapToEmailJob(item: any): EmailJob {
  return {
    recipient_email: item.email ?? item.recipient ?? "unknown",
    subject: item.subject ?? "ProspectIQ Notification",
    body: item.body ?? "Automated message",
    allowProductionSend: true,
    protection: {
      throttle: true,
      switchProvider: false,
    },
  };
}
