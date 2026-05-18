import { NextRequest, NextResponse } from "next/server"
import {
  analyzeExecutiveWorkspace,
  calculateExecutiveReadinessScore,
} from "@/lib/agents/executive/executive-agent"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, createEvents = false } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const baseUrl = req.nextUrl.origin

    const [intelligenceResponse, pipelineResponse, engagementResponse, actionsResponse] =
      await Promise.all([
        fetch(`${baseUrl}/api/dashboard/intelligence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/agents/pipeline`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/agents/engagement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/ai/autonomous-actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
          cache: "no-store",
        }),
      ])

    const intelligenceData = await intelligenceResponse.json()
    const pipelineData = await pipelineResponse.json()
    const engagementData = await engagementResponse.json()
    const actionsData = await actionsResponse.json()

    if (!intelligenceResponse.ok) {
      return NextResponse.json(
        { error: intelligenceData.error || "Failed to load intelligence" },
        { status: 500 }
      )
    }

    const intelligence = intelligenceData.intelligence

    const insights = analyzeExecutiveWorkspace({
      intelligence,
      pipelineRisks: pipelineData.risks || [],
      engagementSignals: engagementData.signals || [],
      autonomousActions: actionsData.actions || [],
    })

    const readinessScore = calculateExecutiveReadinessScore({
      intelligence,
      insights,
    })

    const createdEvents: any[] = []

    if (createEvents) {
      for (const insight of insights) {
        const eventResponse = await fetch(`${baseUrl}/api/workspace/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            eventType: insight.eventType,
            entityType: "executive_agent",
            title: insight.title,
            description: insight.recommendation,
            severity: insight.severity,
            source: "executive_agent",
            createNotification: insight.severity !== "low",
            notificationPriority: insight.severity,
            actionHref: insight.href,
            metadata: {
              category: insight.category,
              summary: insight.summary,
              readinessScore,
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
      readinessScore,
      insights,
      createdEvents,
      count: insights.length,
      agent: "executive",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Executive agent execution failed" },
      { status: 500 }
    )
  }
}
