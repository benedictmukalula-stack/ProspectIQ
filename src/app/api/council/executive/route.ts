import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { generateRevenueForecast } from "../lib/enterprise/revenue-forecast-engine"
import { generatePlatformIntelligenceMesh } from "../lib/global-intelligence/platform-intelligence-mesh"
import { generateSelfImprovementDirectives } from "../lib/self-improvement/self-improving-optimizer"
import { generateAutonomousStrategicDecisions } from "../lib/strategy/autonomous-strategy-engine"
import { generateExecutiveBriefing } from "../lib/boardroom/executive-briefing-engine"
import { generateExecutiveSimulations } from "../lib/simulation/executive-simulation-engine"
import { generateExecutiveGovernance } from "../lib/governance/executive-governance-engine"
import { meterWorkspaceUsage } from "../lib/commercial/usage-metering-engine"
import { buildExecutiveCouncilOpinions } from "../lib/council/executive-council"
import { calculateCouncilConsensus } from "../lib/coordination/consensus-engine"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get("workspaceId")
    const plan =
      (searchParams.get("plan") as "free" | "pro" | "business" | "enterprise") ||
      "business"

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
      activityResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("crm_contacts")
        .select("id,lead_score,lifecycle_stage,hot_lead")
        .eq("workspace_id", workspaceId),

      supabaseAdmin
        .from("outbound_send_queue")
        .select("id,status")
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

      supabaseAdmin
        .from("activity_events")
        .select("id,type")
        .eq("workspace_id", workspaceId),
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

    const simulation = generateExecutiveSimulations({
      weightedPipelineScore: forecast.summary.weightedPipelineScore,
      engagementRate: forecast.summary.engagementRate,
      replyRate: forecast.summary.replyRate,
      failureRate: forecast.summary.failureRate,
      hot: forecast.summary.hot,
      warm: forecast.summary.warm,
      sent: forecast.summary.sent,
    })

    const governance = generateExecutiveGovernance({
      briefing: briefing.summary,
      simulation: simulation.summary,
    })

    const activityEvents = activityResult.error ? [] : activityResult.data || []

    const commercial = meterWorkspaceUsage({
      plan,
      signals: {
        leads: workspaceLeadsResult.data?.length || 0,
        sent: (workspaceQueueResult.data || []).filter((item) => item.status === "sent").length,
        aiActions: activityEvents.filter((event) =>
          String(event.type || "").includes("ai")
        ).length,
        autonomousRuns: activityEvents.filter((event) =>
          String(event.type || "").includes("autonomous")
        ).length,
        simulations: activityEvents.filter((event) =>
          String(event.type || "").includes("simulation")
        ).length,
      },
    })

    const opinions = buildExecutiveCouncilOpinions({
      governance: governance,
      forecast,
      strategy,
      simulation,
      briefing,
      commercial,
    })

    const consensus = calculateCouncilConsensus(opinions)

    return NextResponse.json({
      success: true,
      workspaceId,
      consensus,
      opinions,
      intelligence: {
        governance: governance.summary,
        forecast: forecast.summary,
        strategy: strategy.summary,
        simulation: simulation.summary,
        boardroom: briefing.summary,
        commercial: {
          plan: commercial.plan,
          commercialStatus: commercial.commercialStatus,
          creditUsageRate: commercial.usage.creditUsageRate,
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Executive council failed",
      },
      { status: 500 }
    )
  }
}
