export type EngagementEventType =
  | "delivered"
  | "opened"
  | "clicked"
  | "replied"
  | "bounced";

export async function trackEvent({
  type,
  messageId,
  metadata,
}: {
  type: EngagementEventType;
  messageId: string;
  metadata?: Record<string, any>;
}) {
  console.log(
    "[ENGAGEMENT EVENT]",
    type,
    messageId,
    metadata
  );

  return {
    success: true,
  };
}
