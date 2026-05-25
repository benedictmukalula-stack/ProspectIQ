import { mapToEmailProtection } from "./mapToEmailProtection";
import { createActivityEvent } from "../activity/events";
import { simulateEngagement } from "../engagement/simulate";
import { recordQueueMetric } from "../metrics/queue";

import { sendProductionEmail } from "../production/email-runtime";
import { evaluateProtectionActions } from "../production/deliverability-protection";
import { computeDeliveryHealth } from "../production/delivery-observability";
import { evaluateThrottle } from "../production/throttling-engine";

type QueueItem = {
  workspaceId?: string | null;
  recipient_email: string;
  subject: string;
  body: string;
};

export async function processOutboundQueue(items: QueueItem[]) {
  const results: any[] = [];
  const liveSendEnabled = process.env.ENABLE_PRODUCTION_EMAIL_SEND === "true";

  const stats = {
    sent: 10,
    delivered: 9,
    opened: 5,
    clicked: 2,
    bounced: 1,
  };

  const health = computeDeliveryHealth(stats);
  const protection = evaluateProtectionActions(health);

  const throttle = evaluateThrottle({
    sentLastHour: stats.sent,
    sentToday: stats.sent,
    bounceRate: health.bounceRate,
  });

  for (const item of items) {
    // 🚫 HARD BLOCK
    if (!throttle.allowed) {
      await createActivityEvent?.({
        workspaceId: item.workspaceId,
        type: "throttled_block",
        severity: "warning",
        title: "Sending blocked by throttle",
        description: throttle.reason,
      });

      continue;
    }

    // ⏱ DELAY if needed
    if (throttle.delayMs > 0) {
      await new Promise((r) => setTimeout(r, throttle.delayMs));
    }

    await createActivityEvent?.({
      workspaceId: item.workspaceId,
      type: "queue_processing",
      severity: "info",
      title: "Processing outbound email",
      description: `Sending email to ${(item as any).email ?? (item as any).recipient ?? ""}`,
      metadata: {
        throttle,
        protection: mapToEmailProtection((item as any).protection ?? { suppressSending: false, riskLevel: "low", mode: "safe" }),
      },
    });

    const delivery = await sendProductionEmail({
      recipient_email: (item as any).email ?? (item as any).recipient ?? "",
      subject: item.subject,
      body: item.body,
      allowProductionSend: liveSendEnabled,
      protection: mapToEmailProtection((item as any).protection ?? { suppressSending: false, riskLevel: "low", mode: "safe" }),
    });

    if (delivery.success) {
      await createActivityEvent?.({
        workspaceId: item.workspaceId,
        type:
          delivery.mode === "production"
            ? "email_sent"
            : "email_sent_simulated",
        severity: "success",
        title:
          delivery.mode === "production"
            ? "Outbound email sent"
            : "Outbound email simulated",
        description: `Email processed to ${(item as any).email ?? (item as any).recipient ?? ""}`,
        metadata: delivery,
      });

      if (delivery.messageId) {
        await simulateEngagement({
          workspaceId: item.workspaceId,
          outboundMessageId: delivery.messageId,
        });
      }
    }

    results.push(delivery);
  }

  return results;
}
