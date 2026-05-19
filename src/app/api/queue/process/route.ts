import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { processOutboundQueue } from "@/lib/queue/process";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const { data, error } = await supabaseAdmin
    .from("outbound_messages")
    .select("*")
    .eq("status", "pending")
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
      to: item.recipient,
      subject: item.subject || "ProspectIQ Outreach",
      body: item.body || "",
    }))
  );

  for (let i = 0; i < data.length; i++) {
    const queueItem = data[i];
    const result = results[i];

    await supabaseAdmin
      .from("outbound_messages")
      .update({
        status: result.success ? "delivered" : "failed",
        sent_at: result.success ? new Date().toISOString() : null,
        failed_at: result.success ? null : new Date().toISOString(),
        provider_message_id: result.messageId,
        error: result.error || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", queueItem.id);
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    results,
  });
}
