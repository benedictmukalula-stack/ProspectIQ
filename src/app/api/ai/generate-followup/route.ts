import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { generateFollowupEmail } from "@/lib/ai/copilot-email-generator"

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

    const { data: lead, error } = await supabaseAdmin
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

    if (error) {
      throw new Error(error.message)
    }

    const normalizedLead = {
      ...lead,
      crm_companies: Array.isArray(lead.crm_companies)
        ? lead.crm_companies[0] || null
        : lead.crm_companies,
    }

    const generated = generateFollowupEmail(normalizedLead)

    return NextResponse.json({
      success: true,
      contactId,
      email: lead.email,
      lead: normalizedLead,
      generated,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Follow-up generation failed",
      },
      { status: 500 }
    )
  }
}
