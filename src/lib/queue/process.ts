import { createActivityEvent } from "@/lib/activity/events";
import { simulateEngagement } from "@/lib/engagement/simulate";
import { recordQueueMetric } from "@/lib/metrics/queue";
import { sendProductionEmail } from "@/lib/production/email-runtime";

type QueueItem = {
  workspaceId?: string | null;
  to: string;
  subject: string;
  body: string;
};

type QueueProcessResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
  mode?: string;
};

function productionSendEnabled() {
  return process.env.ENABLE_PRODUCTION_EMAIL_SEND === "true";
}

export async function processOutboundQueue(
  items: QueueItem[]
): Promise<QueueProcessResult[]> {
  const results: QueueProcessResult[] = [];
  const liveSendEnabled = productionSendEnabled();

  for (const item of items) {
    await createActivityEvent({
      workspaceId: item.workspaceId,
      type: "queue_processing",
      severity: "info",
      title: "Processing outbound email",
      description: `Sending email to ${item.to}`,
      metadata: {
        productionSendEnabled: liveSendEnabled,
      },
    });

    const delivery = await sendProductionEmail({
      to: item.to,
      subject: item.subject,
      body: item.body,
      allowProductionSend: liveSendEnabled,
    });

    if (delivery.success) {
      await createActivityEvent({
        workspaceId: item.workspaceId,
        type: delivery.mode === "production" ? "email_sent" : "email_sent_simulated",
        severity: "success",
        title:
          delivery.mode === "production"
            ? "Outbound email sent"
            : "Outbound email simulated",
        description:
          delivery.mode === "production"
            ? `Email sent to ${item.to}`
            : `Email simulated to ${item.to}`,
        metadata: {
          provider: delivery.provider,
          mode: delivery.mode,
          messageId: delivery.messageId,
        },
      });

      if (delivery.messageId) {
        await simulateEngagement({
          workspaceId: item.workspaceId,
          outboundMessageId: delivery.messageId,
        });
      }
    } else {
      await createActivityEvent({
        workspaceId: item.workspaceId,
        type: "email_failed",
        severity: "warning",
        title: "Outbound email failed",
        description: delivery.error || `Email failed to ${item.to}`,
        metadata: {
          provider: delivery.provider,
          mode: delivery.mode,
          error: delivery.error,
        },
      });

      await recordQueueMetric({
        workspaceId: item.workspaceId,
        processed: 1,
        delivered: 0,
        failed: 1,
      });
    }

    results.push({
      success: delivery.success,
      messageId: delivery.messageId,
      error: delivery.error,
      provider: delivery.provider,
      mode: delivery.mode,
    });
  }

  return results;
}
