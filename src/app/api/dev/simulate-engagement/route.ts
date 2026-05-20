import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type EngagementEventType = "opened" | "clicked" | "replied"

type SimulatedEngagementEvent = {
  id: string
  workspace_id: string
  outbound_message_id: string
  event_type: EngagementEventType
  provider: string
  provider_event_id: string
  metadata: Record<string, unknown>
  created_at?: string
}

const EVENT_TYPES: EngagementEventType[] = [
  "opened",
  "clicked",
  "replied",
]

function randomEventType(): EngagementEventType {
  return EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]
}

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      )
    }

    const { data: sentMessages, error: messagesError } = await supabaseAdmin
      .from("outbound_send_queue")
      .select("id,workspace_id,contact_id,status,sent_at")
      .eq("workspace_id", workspaceId)
      .eq("status", "sent")
      .not("sent_at", "is", null)
      .limit(25)

    if (messagesError) {
      throw new Error(messagesError.message)
    }

    if (!sentMessages || sentMessages.length === 0) {
      return NextResponse.json({
        success: true,
        simulated: 0,
        events: [],
        message: "No sent messages available for engagement simulation.",
      })
    }

    const insertedEvents: SimulatedEngagementEvent[] = []

    for (const message of sentMessages) {
      const eventType = randomEventType()

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("engagement_events")
        .insert({
          workspace_id: workspaceId,
          outbound_message_id: message.id,
          event_type: eventType,
          provider: "simulation",
          provider_event_id: `sim_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}`,
          metadata: {
            simulated: true,
            queue_id: message.id,
            contact_id: message.contact_id,
            event_type: eventType,
          },
        })
        .select("id,workspace_id,outbound_message_id,event_type,provider,provider_event_id,metadata,created_at")
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      if (inserted) {
        insertedEvents.push(inserted as SimulatedEngagementEvent)
      }
    }

    return NextResponse.json({
      success: true,
      simulated: insertedEvents.length,
      events: insertedEvents,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Simulation failed",
      },
      { status: 500 }
    )
  }
}
