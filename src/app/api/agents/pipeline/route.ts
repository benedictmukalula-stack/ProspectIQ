import { NextRequest, NextResponse } from "next/server"
import { analyzePipelineRisk } from "@/lib/agents/pipeline/pipeline-agent"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, createEvents = false } = await req.json()

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      )
    }

    const baseUrl = req.nextUrl.origin

    const intelligenceResponse = await fetch(
      `${baseUrl}/api/dashboard/intelligence`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
        }),
      }
    )

    const intelligenceData = await intelligenceResponse.json()

    if (!intelligenceResponse.ok) {
      return NextResponse.json(
        {
          error:
            intelligenceData.error ||
            "Failed to load workspace intelligence",
        },
        { status: 500 }
      )
    }

    const risks = analyzePipelineRisk(
      intelligenceData.intelligence
    )

    const createdEvents: any[] = []

    if (createEvents) {
      for (const risk of risks) {
        const eventResponse = await fetch(
          `${baseUrl}/api/workspace/events`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              workspaceId,
              eventType: risk.eventType,
              entityType: "pipeline_agent",
              title: risk.title,
              description: risk.recommendation,
              severity: risk.severity,
              source: "pipeline_agent",
              createNotification: true,
              notificationPriority: risk.severity,
              actionHref: risk.href,
              metadata: {
                reason: risk.reason,
              },
            }),
          }
        )

        const eventData = await eventResponse.json()

        if (eventResponse.ok) {
          createdEvents.push(eventData)
        }
      }
    }

    return NextResponse.json({
      risks,
      createdEvents,
      count: risks.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Pipeline agent execution failed",
      },
      { status: 500 }
    )
  }
}
