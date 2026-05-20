import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Recommendation = {
  priority: "critical" | "high" | "medium" | "low"
  category: string
  title: string
  detail: string
  action: string
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

    const { data: contacts, error: contactsError } = await supabaseAdmin
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

    if (contactsError) {
      throw new Error(contactsError.message)
    }

    const { data: queue, error: queueError } = await supabaseAdmin
      .from("outbound_send_queue")
      .select("id,status,sent_at,contact_id,workspace_id")
      .eq("workspace_id", workspaceId)

    if (queueError) {
      throw new Error(queueError.message)
    }

    const recommendations: Recommendation[] = []

    const hotLeads = (contacts || []).filter(
      (lead) => lead.hot_lead || lead.lifecycle_stage === "hot"
    )

    const salesReady = (contacts || []).filter(
      (lead) => lead.lifecycle_stage === "sales-ready"
    )

    const warmLeads = (contacts || []).filter(
      (lead) => lead.lifecycle_stage === "warm"
    )

    const coldLeads = (contacts || []).filter(
      (lead) => lead.lifecycle_stage === "cold"
    )

    const sentCount = (queue || []).filter((item) => item.status === "sent").length
    const failedCount = (queue || []).filter((item) => item.status === "failed").length
    const pendingCount = (queue || []).filter((item) => item.status === "pending").length

    if (salesReady.length > 0) {
      recommendations.push({
        priority: "critical",
        category: "Revenue",
        title: `${salesReady.length} sales-ready lead${salesReady.length === 1 ? "" : "s"} detected`,
        detail: "These contacts have the strongest engagement profile and should be prioritized for direct sales action.",
        action: "Assign sales-ready leads to pipeline follow-up immediately.",
      })
    }

    if (hotLeads.length > 0) {
      recommendations.push({
        priority: "high",
        category: "Lead Priority",
        title: `${hotLeads.length} hot lead${hotLeads.length === 1 ? "" : "s"} require follow-up`,
        detail: "Hot leads have strong engagement signals such as replies, clicks, or repeated opens.",
        action: "Create tasks or launch a personalized follow-up sequence.",
      })
    }

    if (warmLeads.length > coldLeads.length && warmLeads.length > 0) {
      recommendations.push({
        priority: "medium",
        category: "Nurture",
        title: "Warm lead pool is growing",
        detail: `${warmLeads.length} contacts are showing moderate engagement and can be moved toward conversion with targeted messaging.`,
        action: "Enroll warm leads into a value-led nurture sequence.",
      })
    }

    if (pendingCount > 0) {
      recommendations.push({
        priority: "medium",
        category: "Operations",
        title: `${pendingCount} pending queue item${pendingCount === 1 ? "" : "s"}`,
        detail: "There are outbound messages ready or waiting for processing.",
        action: "Run the queue processor or schedule automatic queue execution.",
      })
    }

    if (failedCount > 0) {
      recommendations.push({
        priority: "high",
        category: "Delivery Risk",
        title: `${failedCount} failed outbound message${failedCount === 1 ? "" : "s"}`,
        detail: "Delivery failures can reduce campaign performance and should be inspected.",
        action: "Review failed queue records and provider configuration.",
      })
    }

    if (sentCount > 0 && hotLeads.length === 0 && salesReady.length === 0) {
      recommendations.push({
        priority: "medium",
        category: "Conversion",
        title: "Outbound activity has not produced high-intent leads yet",
        detail: `${sentCount} messages were sent, but no hot or sales-ready leads are currently identified.`,
        action: "Review subject lines, targeting, and follow-up copy.",
      })
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: "low",
        category: "System",
        title: "No urgent intelligence actions detected",
        detail: "The workspace is operating normally with no critical lead or delivery signals.",
        action: "Continue monitoring engagement and pipeline movement.",
      })
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalContacts: contacts?.length || 0,
        salesReady: salesReady.length,
        hot: hotLeads.length,
        warm: warmLeads.length,
        cold: coldLeads.length,
        sent: sentCount,
        pending: pendingCount,
        failed: failedCount,
      },
      recommendations,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Recommendations failed",
      },
      { status: 500 }
    )
  }
}
