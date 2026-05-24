import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { buildWorkspaceCommandGraph } from "../lib/graph/relationship-graph"

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get("workspaceId")

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
  }

  const [
    workspaceResult,
    contactsResult,
    sequencesResult,
    queueResult,
    engagementResult,
    workflowsResult,
    snapshotsResult,
  ] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
    supabase.from("crm_contacts").select("*").eq("workspace_id", workspaceId),
    supabase.from("outbound_sequences").select("*").eq("workspace_id", workspaceId),
    supabase.from("outbound_send_queue").select("*").eq("workspace_id", workspaceId),
    supabase.from("outbound_engagement_events").select("*").eq("workspace_id", workspaceId),
    supabase.from("ai_workflows").select("*").eq("workspace_id", workspaceId),
    supabase
      .from("agent_runtime_snapshots")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  if (workspaceResult.error) {
    return NextResponse.json({ error: workspaceResult.error.message }, { status: 500 })
  }

  const graph = buildWorkspaceCommandGraph({
    workspace: workspaceResult.data,
    contacts: contactsResult.data || [],
    sequences: sequencesResult.data || [],
    queue: queueResult.data || [],
    engagement: engagementResult.data || [],
    workflows: workflowsResult.data || [],
    runtimeSnapshots: snapshotsResult.data || [],
  })

  return NextResponse.json({ graph })
}
