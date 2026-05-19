import { createClient } from "@supabase/supabase-js";

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

  return {
    success: true,
  };
}
