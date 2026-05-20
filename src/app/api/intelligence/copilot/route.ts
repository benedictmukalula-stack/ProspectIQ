import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CopilotAction = {
  type: "follow_up" | "nurture" | "review" | "operations"
  priority: "critical" | "high" | "medium" | "low"
  title: string
  reasoning: string
  suggestedMessage?: string
  contactId?: string
  email?: string
}

function leadName(lead: any) {
  return (
    [lead.first_name, lead.last_name].filter(Boolean).join(" ") ||
    lead.email ||
    "this lead"
  )
}

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

    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("crm_contacts")
      .select(`
        id,
        first_name,
        last_name,
        email,
        title,
        lead_score,
        hot_lead,
        lifecycle_stage,
        crm_companies(name,industry,domain)
      `)
      .eq("workspace_id", workspaceId)
      .order("lead_score", { ascending: false })
      .limit(25)

    if (leadsError) {
      throw new Error(leadsError.message)
    }

    const { data: queue, error: queueError } = await supabaseAdmin
      .from("outbound_send_queue")
      .select("id,status,sent_at,contact_id")
      .eq("workspace_id", workspaceId)

    if (queueError) {
      throw new Error(queueError.message)
    }

    const actions: CopilotAction[] = []

    const hotLeads = (leads || []).filter(
      (lead) => lead.hot_lead || lead.lifecycle_stage === "hot"
    )

    const salesReady = (leads || []).filter(
      (lead) => lead.lifecycle_stage === "sales-ready"
    )

    const warmLeads = (leads || []).filter(
      (lead) => lead.lifecycle_stage === "warm"
    )

    const pendingQueue = (queue || []).filter((item) => item.status === "pending")
    const failedQueue = (queue || []).filter((item) => item.status === "failed")

    for (const lead of salesReady.slice(0, 3)) {
      actions.push({
        type: "follow_up",
        priority: "critical",
        contactId: lead.id,
        email: lead.email,
        title: `Direct sales follow-up for ${leadName(lead)}`,
        reasoning:
          "This lead is sales-ready based on strong engagement scoring and should be handled as a priority opportunity.",
        suggestedMessage: `Hi ${lead.first_name || "there"}, thanks for engaging with our outreach. Based on your interest, I thought it would be useful to schedule a short conversation and explore how ProspectIQ can support your sales intelligence workflow.`,
      })
    }

    for (const lead of hotLeads.slice(0, 5)) {
      actions.push({
        type: "follow_up",
        priority: "high",
        contactId: lead.id,
        email: lead.email,
        title: `Personalized follow-up for ${leadName(lead)}`,
        reasoning:
          "This contact is showing high-intent engagement signals and should receive a tailored next touch.",
        suggestedMessage: `Hi ${lead.first_name || "there"}, I noticed strong engagement around our previous message. Would it make sense to share a quick overview of how ProspectIQ helps teams prioritize leads, automate outreach, and surface revenue opportunities?`,
      })
    }

    if (warmLeads.length > 0) {
      actions.push({
        type: "nurture",
        priority: "medium",
        title: `Launch nurture sequence for ${warmLeads.length} warm lead${warmLeads.length === 1 ? "" : "s"}`,
        reasoning:
          "Warm leads show enough engagement to continue education-based follow-up, but may not be ready for direct sales intervention.",
        suggestedMessage:
          "Create a value-led nurture campaign focused on use cases, proof points, and practical sales intelligence benefits.",
      })
    }

    if (pendingQueue.length > 0) {
      actions.push({
        type: "operations",
        priority: "medium",
        title: `${pendingQueue.length} outbound message${pendingQueue.length === 1 ? "" : "s"} pending`,
        reasoning:
          "Pending queue items indicate outbound automation is waiting to be processed.",
        suggestedMessage:
          "Run the queue processor or configure scheduled background processing.",
      })
    }

    if (failedQueue.length > 0) {
      actions.push({
        type: "review",
        priority: "high",
        title: `${failedQueue.length} failed outbound message${failedQueue.length === 1 ? "" : "s"} require review`,
        reasoning:
          "Failed messages create delivery risk and can reduce campaign performance.",
        suggestedMessage:
          "Review provider settings, recipient data, and queue error states.",
      })
    }

    if (actions.length === 0) {
      actions.push({
        type: "review",
        priority: "low",
        title: "No urgent copilot actions detected",
        reasoning:
          "The workspace is currently stable with no critical lead, queue, or delivery risks.",
        suggestedMessage:
          "Continue monitoring engagement signals and refresh intelligence after new outbound activity.",
      })
    }

    return NextResponse.json({
      success: true,
      summary: {
        leads: leads?.length || 0,
        salesReady: salesReady.length,
        hot: hotLeads.length,
        warm: warmLeads.length,
        pendingQueue: pendingQueue.length,
        failedQueue: failedQueue.length,
      },
      actions,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Copilot intelligence failed",
      },
      { status: 500 }
    )
  }
}
