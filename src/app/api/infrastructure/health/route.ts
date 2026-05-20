import { NextRequest, NextResponse } from "next/server"
import { analyzeInfrastructureHealth } from "@/lib/infrastructure/infrastructure-agent"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const baseUrl = req.nextUrl.origin

    const [
      intelligenceResponse,
      runtimeResponse,
      approvalsResponse,
      snapshotsResponse,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/intelligence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/agents/runtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          createEvents: false,
        }),
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/governance/approvals?workspaceId=${workspaceId}`, {
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/memory/runtime-snapshot?workspaceId=${workspaceId}`, {
        cache: "no-store",
      }),
    ])

    const [intelligence, runtime, approvals, snapshots] = await Promise.all([
      intelligenceResponse.json(),
      runtimeResponse.json(),
      approvalsResponse.json(),
      snapshotsResponse.json(),
    ])

    const infrastructure = analyzeInfrastructureHealth({
      intelligence: intelligence.intelligence,
      runtime,
      approvals: approvals.approvals || [],
      snapshots: snapshots.snapshots || [],
    })

    return NextResponse.json({
      infrastructure,
      context: {
        runtimeSignals: runtime.totalSignals || 0,
        failedAgents: runtime.failedAgents || 0,
        snapshots: snapshots.snapshots?.length || 0,
        pendingApprovals:
          approvals.approvals?.filter?.((item: any) => item.status === "pending").length || 0,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Infrastructure health check failed" },
      { status: 500 }
    )
  }
}