import { sendEmail } from "@/lib/email/provider";

type QueueItem = {
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
    try {
      const delivery = await sendEmail({
        to: item.to,
        subject: item.subject,
        body: item.body,
      });

      results.push({
        success: delivery.success,
        messageId: delivery.messageId,
        error: delivery.error,
      });
    } catch (error) {
      results.push({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown queue processing error",
      });
    }
  }

  return results;
}
