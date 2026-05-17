import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId, queueId, contactId, eventType, metadata } = await req.json()

    if (!workspaceId || !eventType) {
      return NextResponse.json(
        { error: "Missing workspaceId or eventType" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("outbound_engagement_events")
      .insert({
        workspace_id: workspaceId,
        queue_id: queueId || null,
        contact_id: contactId || null,
        event_type: eventType,
        source: "manual",
        metadata: metadata || {},
      })
      .select("*")
      .single()

    if (error) throw new Error(error.message)

    await supabaseAdmin.from("activity_timeline").insert({
      workspace_id: workspaceId,
      contact_id: contactId || null,
      activity_type: `engagement_${eventType}`,
      title: `Outbound engagement: ${eventType}`,
      description: `ProspectIQ recorded a ${eventType} event.`,
      metadata: data,
    })

    return NextResponse.json({ event: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Engagement tracking failed" },
      { status: 500 }
    )
  }
}
