import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { generateRevenueForecast } from "../lib/enterprise/revenue-forecast-engine"
import { generatePlatformIntelligenceMesh } from "../lib/global-intelligence/platform-intelligence-mesh"
import { generateSelfImprovementDirectives } from "../lib/self-improvement/self-improving-optimizer"
import { generateAutonomousStrategicDecisions } from "../lib/strategy/autonomous-strategy-engine"
import { generateExecutiveBriefing } from "../lib/boardroom/executive-briefing-engine"

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

    const [
      workspaceLeadsResult,
      workspaceQueueResult,
      workspaceEngagementResult,
      platformLeadsResult,
      platformCompaniesResult,
      platformEngagementResult,
      platformQueueResult,
    ] = await Promise.all([
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

      supabaseAdmin
        .from("crm_contacts")
        .select("id,workspace_id,lifecycle_stage,lead_score,hot_lead"),

      supabaseAdmin
        .from("crm_companies")
        .select("id,workspace_id,industry"),

      supabaseAdmin
        .from("engagement_events")
        .select("workspace_id,event_type"),

      supabaseAdmin
        .from("outbound_send_queue")
        .select("workspace_id,status"),
    ])

    if (workspaceLeadsResult.error) throw new Error(workspaceLeadsResult.error.message)
    if (workspaceQueueResult.error) throw new Error(workspaceQueueResult.error.message)
    if (workspaceEngagementResult.error) throw new Error(workspaceEngagementResult.error.message)
    if (platformLeadsResult.error) throw new Error(platformLeadsResult.error.message)
    if (platformCompaniesResult.error) throw new Error(platformCompaniesResult.error.message)
    if (platformEngagementResult.error) throw new Error(platformEngagementResult.error.message)
    if (platformQueueResult.error) throw new Error(platformQueueResult.error.message)

    const forecast = generateRevenueForecast({
      leads: workspaceLeadsResult.data || [],
      queue: workspaceQueueResult.data || [],
      engagementEvents: workspaceEngagementResult.data || [],
    })

    const mesh = generatePlatformIntelligenceMesh({
      leads: platformLeadsResult.data || [],
      companies: platformCompaniesResult.data || [],
      engagementEvents: platformEngagementResult.data || [],
      queue: platformQueueResult.data || [],
    })

    const selfImprovement = generateSelfImprovementDirectives(mesh)

    const strategy = generateAutonomousStrategicDecisions({
      directives: selfImprovement.directives,
      leadingVertical: selfImprovement.summary.leadingVertical,
      engagementRate: selfImprovement.summary.engagementRate,
      replyRate: selfImprovement.summary.replyRate,
      failureRate: selfImprovement.summary.failureRate,
    })

    const briefing = generateExecutiveBriefing({
      forecast,
      strategy,
      mesh,
    })

    return NextResponse.json({
      success: true,
      workspaceId,
      briefing,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Executive briefing failed",
      },
      { status: 500 }
    )
  }
}
