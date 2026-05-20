import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { adaptSequence } from "@/lib/ai/adaptive-sequence-engine"

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
      .select("id,lead_score,lifecycle_stage,hot_lead,email,first_name,last_name")
      .eq("workspace_id", workspaceId)
      .eq("id", contactId)
      .single()

    if (leadError) {
      throw new Error(leadError.message)
    }

    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("outbound_send_queue")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("contact_id", contactId)

    if (messagesError) {
      throw new Error(messagesError.message)
    }

    const messageIds = (messages || []).map((message) => message.id)

    let events: Array<{ event_type?: string | null }> = []

    if (messageIds.length > 0) {
      const { data: engagementEvents, error: eventsError } = await supabaseAdmin
        .from("engagement_events")
        .select("event_type")
        .eq("workspace_id", workspaceId)
        .in("outbound_message_id", messageIds)

      if (eventsError) {
        throw new Error(eventsError.message)
      }

      events = engagementEvents || []
    }

    const decision = adaptSequence({
      events,
      lead,
    })

    return NextResponse.json({
      success: true,
      contactId,
      lead,
      eventCount: events.length,
      events,
      decision,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Adaptive sequence decision failed",
      },
      { status: 500 }
    )
  }
}
