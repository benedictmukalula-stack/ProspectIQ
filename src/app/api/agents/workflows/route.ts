import { NextRequest, NextResponse } from "next/server"
import { executeAutonomousWorkflows } from "../lib/agents/workflows/workflow-executor"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, createEvents = true } = await req.json()

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      )
    }

    const baseUrl = req.nextUrl.origin

    const [
      intelligenceResponse,
      pipelineResponse,
      engagementResponse,
      executiveResponse,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/intelligence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
        }),
      }),

      fetch(`${baseUrl}/api/agents/pipeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
        }),
      }),

      fetch(`${baseUrl}/api/agents/engagement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
        }),
      }),

      fetch(`${baseUrl}/api/agents/executive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
        }),
      }),
    ])

    const intelligenceData = await intelligenceResponse.json()
    const pipelineData = await pipelineResponse.json()
    const engagementData = await engagementResponse.json()
    const executiveData = await executiveResponse.json()

    const executions =
      await executeAutonomousWorkflows({
        intelligence:
          intelligenceData.intelligence || {},
        pipelineRisks:
          pipelineData.risks || [],
        engagementSignals:
          engagementData.signals || [],
        executiveInsights:
          executiveData.insights || [],
      })

    const createdEvents: any[] = []

    if (createEvents) {
      for (const execution of executions) {
        const eventResponse = await fetch(
          `${baseUrl}/api/workspace/events`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              workspaceId,
              eventType:
                `workflow.${execution.type}`,
              entityType: "workflow_engine",
              title: execution.title,
              description:
                execution.description,
              severity: "info",
              source: "workflow_engine",
              createNotification: true,
              notificationPriority: "medium",
              actionHref: execution.href,
              metadata: {
                action: execution.action,
                status: execution.status,
              },
            }),
          }
        )

        const eventData =
          await eventResponse.json()

        if (eventResponse.ok) {
          createdEvents.push(eventData)
        }
      }
    }

    return NextResponse.json({
      executions,
      createdEvents,
      count: executions.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Workflow execution engine failed",
      },
      { status: 500 }
    )
  }
}
