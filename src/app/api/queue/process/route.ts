import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { emailClient } from "@/lib/email/provider";

const MAX_RETRIES = 5;
const BASE_DELAY_SECONDS = 60;

function calculateNextRetry(retryCount: number): Date {
  const delay = BASE_DELAY_SECONDS * Math.pow(2, retryCount);
  return new Date(Date.now() + delay * 1000);
}

export async function POST() {
  const { data: jobs, error: fetchError } = await supabase
    .from("queue")
    .select("*")
    .eq("status", "pending")
    .or("next_retry_at.is.null", "next_retry_at.lte.now()")
    .order("created_at", { ascending: true })
    .limit(10);

  if (fetchError) {
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ success: true, processed: 0, message: "No pending jobs ready" });
  }

  let processed = 0;
  for (const job of jobs) {
    try {
      await emailClient.send({
        to: job.recipient,
        subject: job.subject || "",
        body: job.body || "",
      });

      await supabase
        .from("queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          last_error: null,
          next_retry_at: null,
        })
        .eq("id", job.id);
      processed++;
      console.log(`✅ Job ${job.id} sent to ${job.recipient}`);
    } catch (err: any) {
      console.error(`❌ Job ${job.id} failed:`, err.message);
      const newRetryCount = (job.retry_count || 0) + 1;

      if (newRetryCount >= MAX_RETRIES) {
        await supabase.from("dead_letters").insert({
          original_queue_id: job.id,
          recipient: job.recipient,
          subject: job.subject,
          body: job.body,
          status: job.status,
          last_error: err.message,
          retry_count: newRetryCount,
          metadata: job.metadata,
        });
        await supabase.from("queue").delete().eq("id", job.id);
        console.log(`💀 Job ${job.id} moved to dead letter queue`);
      } else {
        const nextRetryAt = calculateNextRetry(job.retry_count || 0);
        await supabase
          .from("queue")
          .update({
            retry_count: newRetryCount,
            last_error: err.message,
            next_retry_at: nextRetryAt.toISOString(),
            status: "pending",
          })
          .eq("id", job.id);
        console.log(`🔄 Job ${job.id} will retry at ${nextRetryAt.toISOString()}`);
      }
    }
  }

  return NextResponse.json({ success: true, processed });
}
