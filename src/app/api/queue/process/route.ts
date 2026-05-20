import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { recordQueueMetric } from "@/lib/metrics/queue";
import { processOutboundQueue } from "@/lib/queue/process";
import { QUEUE_STATUS } from "@/lib/queue/status";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString();
}

async function hasReply(enrollmentId: string) {
  const { count, error } = await supabaseAdmin
    .from("engagement_events")
    .select("*", { count: "exact", head: true })
    .eq("enrollment_id", enrollmentId)
    .eq("type", "replied");

  if (error) {
    return false;
  }

  return Number(count || 0) > 0;
}

export async function POST() {
  try {
    const now = new Date().toISOString();

    const { data: queueItems, error: selectError } = await supabaseAdmin
      .from("outbound_send_queue")
      .select("*")
      .eq("status", QUEUE_STATUS.PENDING)
      .is("sent_at", null)
      .lte("scheduled_for", now)
      .limit(10);

    if (selectError) {
      throw new Error(`Queue select failed: ${selectError.message}`);
    }

    if (!queueItems || queueItems.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No pending queue items",
      });
    }

    const sendableItems: typeof queueItems = [];

    for (const item of queueItems) {
      if (item.enrollment_id && await hasReply(item.enrollment_id)) {
        await supabaseAdmin
          .from("outbound_send_queue")
          .update({
            status: QUEUE_STATUS.FAILED,
          })
          .eq("id", item.id);

        await supabaseAdmin
          .from("outbound_enrollments")
          .update({
            status: "replied",
            next_send_at: null,
          })
          .eq("id", item.enrollment_id);

        continue;
      }

      sendableItems.push(item);
    }

    if (sendableItems.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "No sendable queue items. Enrollments may have replies.",
      });
    }

    const results = await processOutboundQueue(
      sendableItems.map((item) => ({
        workspaceId: item.workspace_id,
        to: item.metadata?.contact_email || "knowledgecampsa@gmail.com",
        subject: item.subject || "ProspectIQ Outreach",
        body: item.body || "",
      }))
    );

    for (let i = 0; i < sendableItems.length; i++) {
      const queueItem = sendableItems[i];
      const result = results[i];

      const { error: queueUpdateError } = await supabaseAdmin
        .from("outbound_send_queue")
        .update({
          status: result.success ? QUEUE_STATUS.SENT : QUEUE_STATUS.FAILED,
          sent_at: result.success ? new Date().toISOString() : null,
        })
        .eq("id", queueItem.id);

      if (queueUpdateError) {
        throw new Error(`Queue update failed: ${queueUpdateError.message}`);
      }

      await recordQueueMetric({
        workspaceId: queueItem.workspace_id,
        processed: 1,
        delivered: result.success ? 1 : 0,
        failed: result.success ? 0 : 1,
      });

      if (!result.success || !queueItem.enrollment_id || !queueItem.sequence_id) {
        continue;
      }

      const currentStepOrder = Number(queueItem.metadata?.step_order || 1);
      const nextStepOrder = currentStepOrder + 1;

      const { data: nextStep, error: nextStepError } = await supabaseAdmin
        .from("outbound_sequence_steps")
        .select("*")
        .eq("sequence_id", queueItem.sequence_id)
        .eq("step_order", nextStepOrder)
        .maybeSingle();

      if (nextStepError) {
        throw new Error(`Next step lookup failed: ${nextStepError.message}`);
      }

      if (nextStep) {
        const { error: enrollmentAdvanceError } = await supabaseAdmin
          .from("outbound_enrollments")
          .update({
            current_step: nextStepOrder,
            next_send_at: addDays(nextStep.delay_days || 0),
            status: "active",
          })
          .eq("id", queueItem.enrollment_id);

        if (enrollmentAdvanceError) {
          throw new Error(`Enrollment advance failed: ${enrollmentAdvanceError.message}`);
        }
      } else {
        const { error: enrollmentCompleteError } = await supabaseAdmin
          .from("outbound_enrollments")
          .update({
            status: "completed",
            next_send_at: null,
          })
          .eq("id", queueItem.enrollment_id);

        if (enrollmentCompleteError) {
          throw new Error(`Enrollment completion failed: ${enrollmentCompleteError.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Queue processing failed",
      },
      { status: 500 }
    );
  }
}
