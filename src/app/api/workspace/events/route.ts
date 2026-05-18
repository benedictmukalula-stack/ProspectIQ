import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      workspaceId,
      eventType,
      entityType,
      entityId,
      title,
      description,
      severity = "info",
      source = "system",
      actorId,
      actorEmail,
      metadata = {},
      createNotification = false,
      notificationPriority = "medium",
      actionHref,
    } = body

    if (!workspaceId || !eventType || !title) {
      return NextResponse.json(
        { error: "Missing workspaceId, eventType, or title" },
        { status: 400 }
      )
    }

    const eventResult = await supabase
      .from("workspace_events")
      .insert({
        workspace_id: workspaceId,
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        title,
        description,
        severity,
        source,
        actor_id: actorId,
        actor_email: actorEmail,
        metadata,
      })
      .select("*")
      .single()

    if (eventResult.error) {
      return NextResponse.json({ error: eventResult.error.message }, { status: 500 })
    }

    let notification = null

    if (createNotification) {
      const notificationResult = await supabase
        .from("workspace_notifications")
        .insert({
          workspace_id: workspaceId,
          event_id: eventResult.data.id,
          title,
          description,
          category: entityType || "system",
          priority: notificationPriority,
          action_href: actionHref,
          metadata,
        })
        .select("*")
        .single()

      if (!notificationResult.error) {
        notification = notificationResult.data
      }
    }

    return NextResponse.json({
      event: eventResult.data,
      notification,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create workspace event" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get("workspaceId")

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
  }

  const result = await supabase
    .from("workspace_events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ events: result.data || [] })
}
