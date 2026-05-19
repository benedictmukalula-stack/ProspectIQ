import { createClient } from "@supabase/supabase-js";

export type ActivitySeverity =
  | "info"
  | "success"
  | "warning"
  | "high"
  | "critical";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createActivityEvent({
  workspaceId,
  type,
  severity = "info",
  title,
  description,
  metadata,
}: {
  workspaceId?: string | null;
  type: string;
  severity?: ActivitySeverity;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}) {
  const { error } = await supabaseAdmin
    .from("activity_events")
    .insert({
      workspace_id: workspaceId,
      type,
      severity,
      title,
      description,
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
