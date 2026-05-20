import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { generateFollowupEmail } from "@/lib/ai/copilot-email-generator"
import { QUEUE_STATUS } from "@/lib/queue/status"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId, contactId } = await req.json()

    if (!workspaceId || !contactId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId or contactId" },
        { status: 400 }
      )
    }

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("crm_contacts")
      .select(`
        id,
        first_name,
        last_name,
        email,
        title,
        lead_score,
        lifecycle_stage,
        hot_lead,
        crm_companies(name,industry,domain)
      `)
      .eq("workspace_id", workspaceId)
      .eq("id", contactId)
      .single()

    if (leadError) {
      throw new Error(leadError.message)
    }

    if (!lead?.email) {
      return NextResponse.json(
        { success: false, error: "Contact has no email address" },
        { status: 400 }
      )
    }

    const normalizedLead = {
      ...lead,
      crm_companies: Array.isArray(lead.crm_companies)
        ? lead.crm_companies[0] || null
        : lead.crm_companies,
    }

    const generated = generateFollowupEmail(normalizedLead)

    const { data: queueItem, error: queueError } = await supabaseAdmin
      .from("outbound_send_queue")
      .insert({
        workspace_id: workspaceId,
        contact_id: contactId,
        channel: "email",
        subject: generated.subject,
        body: generated.body,
        status: QUEUE_STATUS.PENDING,
        scheduled_for: new Date().toISOString(),
        metadata: {
          source: "ai_copilot",
          strategy: generated.strategy,
          reasoning: generated.reasoning,
          contact_email: lead.email,
          contact_id: contactId,
        },
      })
      .select("*")
      .single()

    if (queueError) {
      throw new Error(queueError.message)
    }

    return NextResponse.json({
      success: true,
      contactId,
      email: lead.email,
      generated,
      queueItem,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "AI follow-up queueing failed",
      },
      { status: 500 }
    )
  }
}
