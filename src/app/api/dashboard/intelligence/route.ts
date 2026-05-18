import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const [
      contactsResult,
      sequencesResult,
      queueResult,
      engagementResult,
      workflowsResult,
      runsResult,
      teamResult,
    ] = await Promise.all([
      supabase.from("crm_contacts").select("id,status,email,created_at").eq("workspace_id", workspaceId),
      supabase.from("outbound_sequences").select("id,status,name,created_at").eq("workspace_id", workspaceId),
      supabase.from("outbound_send_queue").select("id,status,created_at,sent_at").eq("workspace_id", workspaceId),
      supabase.from("outbound_engagement_events").select("id,event_type,created_at").eq("workspace_id", workspaceId),
      supabase.from("ai_workflows").select("id,status,action_type,created_at").eq("workspace_id", workspaceId),
      supabase.from("ai_workflow_runs").select("id,status,created_at").eq("workspace_id", workspaceId),
      supabase.from("team_members").select("id,status,role,email,created_at").eq("workspace_id", workspaceId),
    ])

    const contacts = contactsResult.data || []
    const sequences = sequencesResult.data || []
    const queue = queueResult.data || []
    const engagement = engagementResult.data || []
    const workflows = workflowsResult.data || []
    const runs = runsResult.data || []
    const team = teamResult.data || []

    const sent = queue.filter((item) => item.status === "sent").length
    const queued = queue.filter((item) => item.status === "queued").length
    const opened = engagement.filter((event) => event.event_type === "opened").length
    const clicked = engagement.filter((event) => event.event_type === "clicked").length
    const replied = engagement.filter((event) => event.event_type === "replied").length

    const openRate = sent ? Math.round((opened / sent) * 100) : 0
    const clickRate = sent ? Math.round((clicked / sent) * 100) : 0
    const replyRate = sent ? Math.round((replied / sent) * 100) : 0

    return NextResponse.json({
      intelligence: {
        workspaceId,
        summary: {
          contacts: contacts.length,
          sequences: sequences.length,
          activeSequences: sequences.filter((s) => s.status === "active").length,
          queuedEmails: queued,
          sentEmails: sent,
          engagementEvents: engagement.length,
          aiWorkflows: workflows.length,
          activeAiWorkflows: workflows.filter((w) => w.status === "active").length,
          aiRuns: runs.length,
          teamMembers: team.length,
        },
        performance: {
          opened,
          clicked,
          replied,
          openRate,
          clickRate,
          replyRate,
        },
        health: {
          workspace: "active",
          supabase: "connected",
          queueEngine: "operational",
          emailProvider: "mock_mode",
          tracking: engagement.length ? "active" : "ready",
          security: "review_needed",
        },
        recommendations: [
          {
            title: "Connect production email provider",
            priority: "high",
            href: "/dashboard/integrations",
          },
          {
            title: "Enable Supabase RLS policies",
            priority: "high",
            href: "/dashboard/security",
          },
          {
            title: "Review outbound engagement performance",
            priority: "medium",
            href: "/dashboard/analytics",
          },
        ],
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard intelligence" },
      { status: 500 }
    )
  }
}
