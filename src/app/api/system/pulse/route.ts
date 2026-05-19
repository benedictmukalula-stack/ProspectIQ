import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {

  const [
    activityResult,
    engagementResult,
    queueResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("activity_events")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabaseAdmin
      .from("engagement_events")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabaseAdmin
      .from("queue_metrics")
      .select("*", {
        count: "exact",
        head: true,
      }),
  ])

  return NextResponse.json({
    success: true,
    pulse: {
      activityEvents:
        activityResult.count || 0,

      engagementEvents:
        engagementResult.count || 0,

      queueOperations:
        queueResult.count || 0,

      systemStatus: "operational",

      timestamp:
        new Date().toISOString(),
    },
  })
}
