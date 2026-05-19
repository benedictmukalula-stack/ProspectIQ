import { createClient } from "@supabase/supabase-js";
import { createActivityEvent } from "@/lib/activity/events";

export type EngagementEventType =
  | "delivered"
  | "opened"
  | "clicked"
  | "replied"
  | "bounced"
  | "failed";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function trackEvent({
  workspaceId,
  outboundMessageId,
  type,
  provider = "resend",
  providerEventId,
  metadata,
}: {
  workspaceId?: string | null;
  outboundMessageId?: string | null;
  type: EngagementEventType;
  provider?: string;
  providerEventId?: string;
  metadata?: Record<string, any>;
}) {
  const { error } = await supabaseAdmin
    .from("engagement_events")
    .insert({
      workspace_id: workspaceId,
      outbound_message_id: outboundMessageId,
      event_type: type,
      provider,
      provider_event_id: providerEventId,
      metadata: metadata || {},
    });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  await createActivityEvent({
    workspaceId,
    type: `engagement_${type}`,
    severity:
      type === "bounced" || type === "failed"
        ? "warning"
        : type === "replied"
          ? "high"
          : "success",
    title: `Engagement event: ${type}`,
    description: outboundMessageId
      ? `Outbound message ${outboundMessageId} recorded ${type}.`
      : `Outbound engagement event recorded: ${type}.`,
    metadata: {
      outboundMessageId,
      provider,
      providerEventId,
      ...(metadata || {}),
    },
  });

  return {
    success: true,
  };
}
