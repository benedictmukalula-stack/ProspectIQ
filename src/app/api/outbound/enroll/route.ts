import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId, sequenceId, contactId } = await req.json()

    if (!workspaceId || !sequenceId || !contactId) {
      return NextResponse.json(
        { error: "Missing workspaceId, sequenceId, or contactId" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("outbound_enrollments")
      .upsert(
        {
          workspace_id: workspaceId,
          sequence_id: sequenceId,
          contact_id: contactId,
          status: "active",
          current_step: 1,
          next_send_at: new Date().toISOString(),
        },
        { onConflict: "sequence_id,contact_id" }
      )
      .select("*")
      .single()

    if (error) throw new Error(error.message)

    await supabaseAdmin.from("activity_timeline").insert({
      workspace_id: workspaceId,
      contact_id: contactId,
      activity_type: "sequence_enrollment",
      title: "Contact enrolled in sequence",
      description: "ProspectIQ enrolled this contact into an outbound sequence.",
      metadata: {
        sequence_id: sequenceId,
        enrollment_id: data.id,
      },
    })

    return NextResponse.json({ enrollment: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Enrollment failed" },
      { status: 500 }
    )
  }
}
