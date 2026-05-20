import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { generateSequenceForLead } from "@/lib/ai/sequence-generator"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId, contactId, createSequence = false } = await req.json()

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

    const normalizedLead = {
      ...lead,
      crm_companies: Array.isArray(lead.crm_companies)
        ? lead.crm_companies[0] || null
        : lead.crm_companies,
    }

    const generated = generateSequenceForLead(normalizedLead)

    if (!createSequence) {
      return NextResponse.json({
        success: true,
        created: false,
        contactId,
        lead: normalizedLead,
        generated,
      })
    }

    const { data: sequence, error: sequenceError } = await supabaseAdmin
      .from("outbound_sequences")
      .insert({
        workspace_id: workspaceId,
        name: generated.sequenceName,
        status: "active",
        description: `AI-generated ${generated.tone} sequence for ${generated.stage} lead.`,
      })
      .select("*")
      .single()

    if (sequenceError) {
      throw new Error(sequenceError.message)
    }

    const { data: steps, error: stepsError } = await supabaseAdmin
      .from("outbound_sequence_steps")
      .insert(
        generated.steps.map((step) => ({
          sequence_id: sequence.id,
          step_order: step.stepOrder,
          delay_days: step.delayDays,
          channel: step.channel,
          subject: step.subject,
          body: step.body,
        }))
      )
      .select("*")

    if (stepsError) {
      throw new Error(stepsError.message)
    }

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from("outbound_enrollments")
      .insert({
        workspace_id: workspaceId,
        sequence_id: sequence.id,
        contact_id: contactId,
        status: "active",
        current_step: 1,
        next_send_at: new Date().toISOString(),
      })
      .select("*")
      .single()

    if (enrollmentError) {
      throw new Error(enrollmentError.message)
    }

    return NextResponse.json({
      success: true,
      created: true,
      contactId,
      lead: normalizedLead,
      generated,
      sequence,
      steps,
      enrollment,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "AI sequence generation failed",
      },
      { status: 500 }
    )
  }
}
