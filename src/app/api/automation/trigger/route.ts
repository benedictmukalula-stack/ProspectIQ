import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId, eventType, entityType, entityId, payload } =
      await req.json()

    if (!workspaceId || !eventType) {
      return NextResponse.json(
        { error: "Missing workspaceId or eventType" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("automation_events")
      .insert({
        workspace_id: workspaceId,
        event_type: eventType,
        entity_type: entityType || null,
        entity_id: entityId || null,
        payload: payload || {},
        status: "pending",
      })
      .select("*")
      .single()

    if (error) throw new Error(error.message)

    await supabaseAdmin.from("activity_timeline").insert({
      workspace_id: workspaceId,
      contact_id: entityType === "contact" ? entityId : null,
      activity_type: "automation_event",
      title: `Automation event created: ${eventType}`,
      description: "ProspectIQ queued an automation event for processing.",
      metadata: data,
    })

    return NextResponse.json({ event: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Trigger failed" },
      { status: 500 }
    )
  }
}
