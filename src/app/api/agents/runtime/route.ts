import { NextRequest, NextResponse } from "next/server"
import { runAgentRuntimeCycle } from "@/lib/agents/runtime/orchestrator"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, createEvents = true } = await req.json()

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      )
    }

    const result = await runAgentRuntimeCycle({
      baseUrl: req.nextUrl.origin,
      workspaceId,
      createEvents,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Agent runtime cycle failed",
      },
      { status: 500 }
    )
  }
}
