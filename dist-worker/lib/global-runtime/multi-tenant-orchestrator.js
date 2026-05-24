import { runAgentRuntimeCycle } from "../lib/agents/runtime/orchestrator";
export async function runMultiTenantRuntime({ baseUrl, workspaces, createEvents = true, }) {
    const results = [];
    for (const workspace of workspaces) {
        try {
            const result = await runAgentRuntimeCycle({
                baseUrl,
                workspaceId: workspace.id,
                createEvents,
            });
            results.push({
                workspace,
                status: "completed",
                result,
            });
        }
        catch (error) {
            results.push({
                workspace,
                status: "failed",
                error: error.message || "Workspace runtime failed",
            });
        }
    }
    return {
        executedAt: new Date().toISOString(),
        workspaceCount: workspaces.length,
        completed: results.filter((item) => item.status === "completed").length,
        failed: results.filter((item) => item.status === "failed").length,
        totalSignals: results.reduce((sum, item) => sum + Number(item.result?.recipienttalSignals || 0), 0),
        results,
    };
}
