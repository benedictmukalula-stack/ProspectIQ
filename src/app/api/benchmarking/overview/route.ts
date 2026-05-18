import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  rankWorkspaces,
  summarizeBenchmarks,
} from "@/lib/benchmarking/workspace-benchmarking"

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  const snapshotsResult = await supabase
    .from("agent_runtime_snapshots")
    .select("*")
    .order("created_at", { ascending: false })

  if (snapshotsResult.error) {
    return NextResponse.json(
      { error: snapshotsResult.error.message },
      { status: 500 }
    )
  }

  const snapshots = snapshotsResult.data || []

  const latestPerWorkspace = new Map<string, any>()

  for (const snapshot of snapshots) {
    if (!latestPerWorkspace.has(snapshot.workspace_id)) {
      latestPerWorkspace.set(snapshot.workspace_id, snapshot)
    }
  }

  const workspaceBenchmarks = Array.from(
    latestPerWorkspace.values()
  ).map((snapshot: any) => ({
    workspaceId: snapshot.workspace_id,
    workspaceName:
      snapshot.intelligence?.workspaceName ||
      snapshot.workspace_id,
    readinessScore: snapshot.readiness_score || 0,
    replyRate: snapshot.reply_rate || 0,
    openRate: snapshot.open_rate || 0,
    sentEmails: snapshot.sent_emails || 0,
    engagementEvents: snapshot.engagement_events || 0,
    totalSignals: snapshot.total_signals || 0,
    failedAgents: snapshot.failed_agents || 0,
  }))

  const ranked = rankWorkspaces(workspaceBenchmarks)

  return NextResponse.json({
    summary: summarizeBenchmarks(ranked),
    rankings: ranked,
  })
}
