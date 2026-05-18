export type AgentRuntimeResult = {
  agent: string
  count: number
  status: "completed" | "failed"
  data?: any
  error?: string
}

export async function runAgentRuntimeCycle({
  baseUrl,
  workspaceId,
  createEvents = true,
}: {
  baseUrl: string
  workspaceId: string
  createEvents?: boolean
}) {
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
  ]

  const results: AgentRuntimeResult[] = []

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
      })

      const data = await response.json()

      if (!response.ok) {
        results.push({
          agent: agent.name,
          count: 0,
          status: "failed",
          error: data.error || "Agent failed",
        })

        continue
      }

      results.push({
        agent: agent.name,
        count: data.count || data.actions?.length || data.risks?.length || data.signals?.length || data.insights?.length || 0,
        status: "completed",
        data,
      })
    } catch (error: any) {
      results.push({
        agent: agent.name,
        count: 0,
        status: "failed",
        error: error.message || "Agent runtime error",
      })
    }
  }

  return {
    workspaceId,
    createEvents,
    executedAt: new Date().toISOString(),
    results,
    totalSignals: results.reduce((sum, item) => sum + item.count, 0),
    failedAgents: results.filter((item) => item.status === "failed").length,
  }
}
