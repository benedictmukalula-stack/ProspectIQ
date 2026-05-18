import { NextRequest, NextResponse } from "next/server"
import { analyzeEngagementSignals } from "@/lib/agents/engagement/engagement-agent"

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

    const signals = analyzeEngagementSignals(intelligenceData.intelligence)
    const createdEvents: any[] = []

    if (createEvents) {
      for (const signal of signals) {
        const eventResponse = await fetch(`${baseUrl}/api/workspace/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            eventType: signal.eventType,
            entityType: "engagement_agent",
            title: signal.title,
            description: signal.recommendation,
            severity: signal.severity,
            source: "engagement_agent",
            createNotification: true,
            notificationPriority: signal.severity,
            actionHref: signal.href,
            metadata: {
              reason: signal.reason,
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
      signals,
      createdEvents,
      count: signals.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Engagement agent execution failed" },
      { status: 500 }
    )
  }
}
