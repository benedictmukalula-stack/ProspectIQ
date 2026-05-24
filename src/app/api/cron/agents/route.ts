import { NextRequest, NextResponse } from "next/server"
import { runAgentRuntimeCycle } from "../lib/agents/runtime/orchestrator"

const DEFAULT_WORKSPACE_ID = "02564f5c-cb1e-4e87-9577-b725bf020714"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspaceId =
      req.nextUrl.searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID

    const result = await runAgentRuntimeCycle({
      baseUrl: req.nextUrl.origin,
      workspaceId,
      createEvents: true,
    })

    return NextResponse.json({
      ok: true,
      type: "agent_runtime_cron",
      result,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Agent cron failed",
      },
      { status: 500 }
    )
  }
}
