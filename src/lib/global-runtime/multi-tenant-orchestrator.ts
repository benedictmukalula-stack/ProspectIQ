import { runAgentRuntimeCycle } from "@/lib/agents/runtime/orchestrator"

export async function runMultiTenantRuntime({
  baseUrl,
  workspaces,
  createEvents = true,
}: {
  baseUrl: string
  workspaces: any[]
  createEvents?: boolean
}) {
  const results = []

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
        status: "failed",
        error: error.message || "Workspace runtime failed",
      })
    }
  }

  return {
    executedAt: new Date().toISOString(),
    workspaceCount: workspaces.length,
    completed: results.filter((item) => item.status === "completed").length,
    failed: results.filter((item) => item.status === "failed").length,
    totalSignals: results.reduce(
      (sum, item: any) => sum + Number(item.result?.totalSignals || 0),
      0
    ),
    results,
  }
}
