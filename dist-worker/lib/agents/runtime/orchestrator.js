export async function runAgentRuntimeCycle({ baseUrl, workspaceId, createEvents = true, }) {
    const agents = [
        {
            name: "pipeline",
            endpoint: "/api/agents/pipeline",
        },
        {
            name: "engagement",
            endpoint: "/api/agents/engagement",
        },
        {
            name: "autonomous_actions",
            endpoint: "/api/ai/autonomous-actions",
        },
        {
            name: "executive",
            endpoint: "/api/agents/executive",
        },
        {
            name: "workflow_engine",
            endpoint: "/api/agents/workflows",
        },
    ];
    const results = [];
    for (const agent of agents) {
        try {
            const response = await fetch(`${baseUrl}${agent.endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workspaceId,
                    createEvents,
                }),
                cache: "no-store",
            });
            const data = await response.json();
            if (!response.ok) {
                results.push({
                    agent: agent.name,
                    count: 0,
                    status: "failed",
                    error: data.error || "Agent failed",
                });
                continue;
            }
            results.push({
                agent: agent.name,
                count: data.count || data.actions?.length || data.risks?.length || data.signals?.length || data.insights?.length || 0,
                status: "completed",
                data,
            });
        }
        catch (error) {
            results.push({
                agent: agent.name,
                count: 0,
                status: "failed",
                error: error.message || "Agent runtime error",
            });
        }
    }
    const runtimeResult = {
        workspaceId,
        createEvents,
        executedAt: new Date().toISOString(),
        results,
        totalSignals: results.reduce((sum, item) => sum + item.count, 0),
        failedAgents: results.filter((item) => item.status === "failed").length,
    };
    try {
        const intelligenceResponse = await fetch(`${baseUrl}/api/dashboard/intelligence`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ workspaceId }),
            cache: "no-store",
        });
        const intelligenceData = await intelligenceResponse.json();
        const executiveResult = results.find((item) => item.agent === "executive");
        const readinessScore = executiveResult?.data?.readinessScore || 0;
        if (intelligenceResponse.ok) {
            await fetch(`${baseUrl}/api/memory/runtime-snapshot`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workspaceId,
                    runtimeResult,
                    intelligence: intelligenceData.intelligence,
                    readinessScore,
                }),
                cache: "no-store",
            });
        }
    }
    catch {
        // Memory capture must never block agent runtime execution.
    }
    return runtimeResult;
}
