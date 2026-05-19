import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function recordQueueMetric({
  workspaceId,
  processed = 0,
  delivered = 0,
  failed = 0,
}: {
  workspaceId?: string | null;
  processed?: number;
  delivered?: number;
  failed?: number;
}) {
  const { error } = await supabaseAdmin
    .from("queue_metrics")
    .insert({
      workspace_id: workspaceId,
      processed_count: processed,
      delivered_count: delivered,
      failed_count: failed,
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
