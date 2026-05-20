import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { QUEUE_STATUS } from "@/lib/queue/status";

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

    const { data: company, error: companyError } = await supabaseAdmin
      .from("crm_companies")
      .insert({
        workspace_id: workspaceId,
        name: "Acme Logistics Group",
        domain: "acmelogistics.example",
        industry: "Logistics",
        size: "200-500",
        location: "Johannesburg, South Africa",
      })
      .select("*")
      .single()

    if (companyError) throw new Error(companyError.message)

    const { data: contact, error: contactError } = await supabaseAdmin
      .from("crm_contacts")
      .insert({
        workspace_id: workspaceId,
        company_id: company.id,
        first_name: "Thabo",
        last_name: "Mokoena",
        email: "thabo@example.com",
        title: "Head of Operations",
        linkedin_url: "https://linkedin.com/in/example",
        source: "manual",
        score: 82,
      })
      .select("*")
      .single()

    if (contactError) throw new Error(contactError.message)

    await supabaseAdmin.from("crm_deals").insert({
      workspace_id: workspaceId,
      company_id: company.id,
      contact_id: contact.id,
      name: "ProspectIQ Sales Intelligence Rollout",
      stage: "qualified",
      value: 2900,
      currency: "USD",
      probability: 65,
    })

    await supabaseAdmin.from("crm_activities").insert({
      workspace_id: workspaceId,
      company_id: company.id,
      contact_id: contact.id,
      type: "call",
      title: "Discovery call",
      notes: "Discuss CRM automation, enrichment, and outbound campaign needs.",
    })

    await supabaseAdmin.from("automation_events").insert({
      workspace_id: workspaceId,
      event_type: "contact_created",
      entity_type: "contact",
      entity_id: contact.id,
      payload: {
        source: "crm_seed",
        contact_id: contact.id,
      },
      status: QUEUE_STATUS.PENDING,
    })

    await supabaseAdmin.from("activity_timeline").insert({
      workspace_id: workspaceId,
      contact_id: contact.id,
      company_id: company.id,
      activity_type: "contact_created",
      title: "New CRM contact created",
      description: "A new contact was added and automation was queued.",
      metadata: {
        contact_id: contact.id,
        company_id: company.id,
      },
    })

    return NextResponse.json({ ok: true, company, contact })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    )
  }
}