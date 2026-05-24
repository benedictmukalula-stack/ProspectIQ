import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { buildSemanticWorkspaceModel } from "../lib/semantic/organizational-ontology"
import { generateKnowledgePriority } from "../lib/knowledge/semantic-ranking"
import { predictRevenueSignals } from "../lib/prediction/revenue-forecast"

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req: NextRequest) {
  const workspaceId =
    req.nextUrl.searchParams.get("workspaceId")

  if (!workspaceId) {
    return NextResponse.json(
      { error: "Missing workspaceId" },
      { status: 400 }
    )
  }

  const [
    workspaceResult,
    contactsResult,
    sequencesResult,
    workflowsResult,
    engagementResult,
  ] = await Promise.all([
    supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single(),

    supabase
      .from("crm_contacts")
      .select("*")
      .eq("workspace_id", workspaceId),

    supabase
      .from("outbound_sequences")
      .select("*")
      .eq("workspace_id", workspaceId),

    supabase
      .from("ai_workflows")
      .select("*")
      .eq("workspace_id", workspaceId),

    supabase
      .from("outbound_engagement_events")
      .select("*")
      .eq("workspace_id", workspaceId),
  ])

  if (workspaceResult.error) {
    return NextResponse.json(
      { error: workspaceResult.error.message },
      { status: 500 }
    )
  }

  const mockPrediction = predictRevenueSignals({
    intelligence: {
      summary: {
        contacts:
          contactsResult.data?.length || 0,
        activeSequences:
          sequencesResult.data?.length || 0,
        aiRuns:
          workflowsResult.data?.length || 0,
      },
      performance: {
        replyRate: 12,
        openRate: 58,
        clickRate: 18,
      },
      health: {
        security: "review_needed",
        emailProvider: "mock_mode",
      },
    },
  })

  const semanticGraph =
    buildSemanticWorkspaceModel({
      workspace: workspaceResult.data,
      contacts: contactsResult.data || [],
      sequences: sequencesResult.data || [],
      workflows: workflowsResult.data || [],
      engagement: engagementResult.data || [],
      predictions: mockPrediction,
    })

  return NextResponse.json({
    semanticGraph,
    priorityRanking: generateKnowledgePriority(
      semanticGraph.entities
    ),
  })
}
