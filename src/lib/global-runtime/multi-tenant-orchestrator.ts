import { runAgentRuntimeCycle } from "@/lib/agents/runtime/orchestrator"
import { QUEUE_STATUS } from "@/lib/queue/status";

export async function runMultiTenantRuntime({
  baseUrl,
  workspaces,
  createEvents = true,
}: {
  baseUrl: string
  workspaces: any[]
  createEvents?: boolean
}) {
  const results: any[] = []

  for (const workspace of workspaces) {
    try {
      const result = await runAgentRuntimeCycle({
        baseUrl,
        workspaceId: workspace.id,
        createEvents,
      })

      results.push({
        workspace,
        status: "completed",
        result,
      })
    } catch (error: any) {
      results.push({
        workspace,
        status: QUEUE_STATUS.FAILED,
        error: error.message || "Workspace runtime failed",
      })
    }
  }

  return {
    executedAt: new Date().toISOString(),
    workspaceCount: workspaces.length,
    completed: results.filter((item) => item.status === "completed").length,
    failed: results.filter((item) => item.status === QUEUE_STATUS.FAILED).length,
    totalSignals: results.reduce(
      (sum, item: any) => sum + Number(item.result?.totalSignals || 0),
      0
    ),
    results,
  }
}