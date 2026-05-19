import { createActivityEvent } from "@/lib/activity/events";
import { simulateEngagement } from "@/lib/engagement/simulate";
import { sendEmail } from "@/lib/email/provider";
import { recordQueueMetric } from "@/lib/metrics/queue";

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
};

export async function processOutboundQueue(
  items: QueueItem[]
): Promise<QueueProcessResult[]> {
  const results: QueueProcessResult[] = [];

  for (const item of items) {
    await createActivityEvent({
      workspaceId: item.workspaceId,
      type: "queue_processing",
      severity: "info",
      title: "Processing outbound email",
      description: `Sending email to ${item.to}`,
    });

    const delivery = await sendEmail({
      to: item.to,
      subject: item.subject,
      body: item.body,
    });

    if (delivery.success) {
      await createActivityEvent({
        workspaceId: item.workspaceId,
        type: "email_sent",
        severity: "success",
        title: "Outbound email sent",
        description: `Email sent to ${item.to}`,
        metadata: {
          provider: delivery.provider,
          messageId: delivery.messageId,
        },
      });

      if (delivery.messageId) {
        await simulateEngagement({
          workspaceId: item.workspaceId,
          outboundMessageId: delivery.messageId,
        });
      }
    }

    if (!delivery.success) {
      await recordQueueMetric({
        workspaceId: item.workspaceId,
        processed: 1,
        delivered: 0,
        failed: 1,
      })
    }

    if (!delivery.success) {
      await recordQueueMetric({
        workspaceId: item.workspaceId,
        processed: 1,
        delivered: 0,
        failed: 1,
      })
    }

    results.push({
      success: delivery.success,
      messageId: delivery.messageId,
      error: delivery.error,
    });
  }

  return results;
}
