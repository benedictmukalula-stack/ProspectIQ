import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import {
  calculateEngagementScore,
  classifyLeadTemperature,
} from "@/lib/engagement/scoring"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type ScoreUpdate = {
  contactId: string
  score: number
  lifecycleStage: string
  events: number
}

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const { data: events, error: eventsError } = await supabaseAdmin
      .from("engagement_events")
      .select("id,event_type,outbound_message_id,workspace_id,created_at")
      .eq("workspace_id", workspaceId)

    if (eventsError) {
      throw new Error(eventsError.message)
    }

    const messageIds = Array.from(
      new Set(
        (events || [])
          .map((event) => event.outbound_message_id)
          .filter(Boolean)
      )
    )

    if (messageIds.length === 0) {
      return NextResponse.json({
        success: true,
        scoredContacts: 0,
        updates: [],
        message: "No engagement events with outbound message references found.",
      })
    }

    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("outbound_send_queue")
      .select("id,contact_id,workspace_id")
      .eq("workspace_id", workspaceId)
      .in("id", messageIds)

    if (messagesError) {
      throw new Error(messagesError.message)
    }

    const messageContactMap = new Map<string, string>()

    for (const message of messages || []) {
      if (message.id && message.contact_id) {
        messageContactMap.set(message.id, message.contact_id)
      }
    }

    const grouped = new Map<string, Array<{ type?: string | null }>>()

    for (const event of events || []) {
      const contactId = event.outbound_message_id
        ? messageContactMap.get(event.outbound_message_id)
        : null

      if (!contactId) continue

      const existing = grouped.get(contactId) || []
      existing.push({ type: event.event_type })
      grouped.set(contactId, existing)
    }

    const updates: ScoreUpdate[] = []

    for (const [contactId, contactEvents] of grouped.entries()) {
      const score = calculateEngagementScore(contactEvents)
      const lifecycleStage = classifyLeadTemperature(score)

      const { error: updateError } = await supabaseAdmin
        .from("crm_contacts")
        .update({
          lead_score: score,
          hot_lead: score >= 30,
          lifecycle_stage: lifecycleStage,
        })
        .eq("id", contactId)
        .eq("workspace_id", workspaceId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      updates.push({
        contactId,
        score,
        lifecycleStage,
        events: contactEvents.length,
      })
    }

    return NextResponse.json({
      success: true,
      scoredContacts: updates.length,
      updates,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Engagement scoring failed",
      },
      { status: 500 }
    )
  }
}
