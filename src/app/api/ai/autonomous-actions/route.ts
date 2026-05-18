import { NextRequest, NextResponse } from "next/server"
import { generateAutonomousActions } from "@/lib/ai/actions/action-engine"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, createEvents = false } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const baseUrl = req.nextUrl.origin

    const intelligenceResponse = await fetch(`${baseUrl}/api/dashboard/intelligence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
      cache: "no-store",
    })

    const intelligenceData = await intelligenceResponse.json()

    if (!intelligenceResponse.ok) {
      return NextResponse.json(
        { error: intelligenceData.error || "Failed to load workspace intelligence" },
        { status: 500 }
      )
    }

    const actions = generateAutonomousActions(intelligenceData.intelligence)

    const createdEvents: any[] = []

    if (createEvents) {
      for (const action of actions) {
        const eventResponse = await fetch(`${baseUrl}/api/workspace/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            eventType: action.eventType,
            entityType: action.category,
            title: action.title,
            description: action.recommendedAction,
            severity: action.priority === "high" ? "warning" : "info",
            source: "ai_action_engine",
            createNotification: true,
            notificationPriority: action.priority,
            actionHref: action.href,
            metadata: {
              reason: action.reason,
              category: action.category,
            },
          }),
        })

        const eventData = await eventResponse.json()

        if (eventResponse.ok) {
          createdEvents.push(eventData)
        }
      }
    }

    return NextResponse.json({
      actions,
      createdEvents,
      count: actions.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate autonomous actions" },
      { status: 500 }
    )
  }
}
