import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const timestamp = Date.now()

    const { data: company, error: companyError } = await supabaseAdmin
      .from("crm_companies")
      .insert({
        workspace_id: workspaceId,
        name: `Knowledge Camp Test Company ${timestamp}`,
        domain: "knowledgecamp.co.za",
        industry: "Training",
      })
      .select("*")
      .single()

    if (companyError) throw new Error(companyError.message)

    const { data: contact, error: contactError } = await supabaseAdmin
      .from("crm_contacts")
      .insert({
        workspace_id: workspaceId,
        company_id: company.id,
        first_name: "Test",
        last_name: "Contact",
        email: "knowledgecampsa@gmail.com",
        title: "Operations Manager",
        status: "active",
      })
      .select("*")
      .single()

    if (contactError) throw new Error(contactError.message)

    const { data: sequence, error: sequenceError } = await supabaseAdmin
      .from("outbound_sequences")
      .insert({
        workspace_id: workspaceId,
        name: `Standard ProspectIQ 3-Step Test Outreach ${timestamp}`,
        status: "active",
      })
      .select("*")
      .single()

    if (sequenceError) throw new Error(sequenceError.message)

    const { data: steps, error: stepsError } = await supabaseAdmin
      .from("outbound_sequence_steps")
      .insert([
        {
          sequence_id: sequence.id,
          step_order: 1,
          channel: "email",
          subject: "Improving sales intelligence visibility",
          body: "Hi there, this is step 1 from ProspectIQ automation.",
          delay_days: 0,
        },
        {
          sequence_id: sequence.id,
          step_order: 2,
          channel: "email",
          subject: "Following up on ProspectIQ",
          body: "Hi there, this is step 2 follow-up from ProspectIQ automation.",
          delay_days: 0,
        },
        {
          sequence_id: sequence.id,
          step_order: 3,
          channel: "email",
          subject: "Final check-in from ProspectIQ",
          body: "Hi there, this is step 3 final follow-up from ProspectIQ automation.",
          delay_days: 0,
        },
      ])
      .select("*")

    if (stepsError) throw new Error(stepsError.message)

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from("outbound_enrollments")
      .insert({
        workspace_id: workspaceId,
        sequence_id: sequence.id,
        contact_id: contact.id,
        status: "active",
        current_step: 1,
        next_send_at: new Date().toISOString(),
      })
      .select("*")
      .single()

    if (enrollmentError) throw new Error(enrollmentError.message)

    return NextResponse.json({
      success: true,
      company,
      contact,
      sequence,
      steps,
      enrollment,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    )
  }
}
