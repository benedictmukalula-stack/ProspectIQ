import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { processOutboundQueue } from "@/lib/queue/process";
import { recordQueueMetric } from "@/lib/metrics/queue";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const { data, error } = await supabaseAdmin
    .from("outbound_send_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(10);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json({
      success: true,
      processed: 0,
      message: "No pending queue items",
    });
  }

  const results = await processOutboundQueue(
    data.map((item) => ({
      workspaceId: item.workspace_id,
      to: item.metadata?.contact_email || item.recipient || "knowledgecampsa@gmail.com",
      subject: item.subject || "ProspectIQ Outreach",
      body: item.body || "",
    }))
  );

  for (let i = 0; i < data.length; i++) {
    const queueItem = data[i];
    const result = results[i];

    await supabaseAdmin
      .from("outbound_send_queue")
      .update({
        status: result.success ? "sent" : "failed",
        sent_at: result.success ? new Date().toISOString() : null,
        failed_at: result.success ? null : new Date().toISOString(),
        provider_message_id: result.messageId,
        error: result.error || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", queueItem.id);

    await recordQueueMetric({
      workspaceId: queueItem.workspace_id,
      processed: 1,
      delivered: result.success ? 1 : 0,
      failed: result.success ? 0 : 1,
    });
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    results,
  });
}
