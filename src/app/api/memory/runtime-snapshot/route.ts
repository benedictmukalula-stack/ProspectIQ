import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { analyzeRuntimeTrend } from "@/lib/memory/trend-analysis"

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, runtimeResult, intelligence, readinessScore = 0 } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const summary = intelligence?.summary || {}
    const performance = intelligence?.performance || {}

    const snapshotPayload = {
      workspace_id: workspaceId,
      source: "agent_runtime",
      intelligence,
      runtime_result: runtimeResult,
      contacts_count: summary.contacts || 0,
      sent_emails: summary.sentEmails || 0,
      engagement_events: summary.engagementEvents || 0,
      open_rate: performance.openRate || 0,
      click_rate: performance.clickRate || 0,
      reply_rate: performance.replyRate || 0,
      readiness_score: readinessScore || 0,
      total_signals: runtimeResult?.totalSignals || 0,
      failed_agents: runtimeResult?.failedAgents || 0,
    }

    const previousResult = await supabase
      .from("agent_runtime_snapshots")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const insertResult = await supabase
      .from("agent_runtime_snapshots")
      .insert(snapshotPayload)
      .select("*")
      .single()

    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
    }

    const trend = analyzeRuntimeTrend(insertResult.data, previousResult.data || null)

    return NextResponse.json({
      snapshot: insertResult.data,
      trend,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to capture runtime snapshot" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get("workspaceId")

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
  }

  const result = await supabase
    .from("agent_runtime_snapshots")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ snapshots: result.data || [] })
}
