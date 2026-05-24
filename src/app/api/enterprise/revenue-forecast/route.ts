import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { generateRevenueForecast } from "../lib/enterprise/revenue-forecast-engine"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      )
    }

    const [leadsResult, queueResult, engagementResult] = await Promise.all([
      supabaseAdmin
        .from("crm_contacts")
        .select("id,lead_score,lifecycle_stage,hot_lead")
        .eq("workspace_id", workspaceId),

      supabaseAdmin
        .from("outbound_send_queue")
        .select("status")
        .eq("workspace_id", workspaceId),

      supabaseAdmin
        .from("engagement_events")
        .select("event_type")
        .eq("workspace_id", workspaceId),
    ])

    if (leadsResult.error) throw new Error(leadsResult.error.message)
    if (queueResult.error) throw new Error(queueResult.error.message)
    if (engagementResult.error) throw new Error(engagementResult.error.message)

    const forecast = generateRevenueForecast({
      leads: leadsResult.data || [],
      queue: queueResult.data || [],
      engagementEvents: engagementResult.data || [],
    })

    return NextResponse.json({
      success: true,
      workspaceId,
      forecast,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Revenue forecast failed",
      },
      { status: 500 }
    )
  }
}
