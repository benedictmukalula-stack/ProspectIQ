export type WorkspaceBenchmark = {
  workspaceId: string
  workspaceName: string
  readinessScore: number
  replyRate: number
  openRate: number
  sentEmails: number
  engagementEvents: number
  totalSignals: number
  failedAgents: number
}

export function calculateTenantHealthScore(workspace: WorkspaceBenchmark) {
  const readinessWeight = workspace.readinessScore * 0.4
  const replyWeight = workspace.replyRate * 0.2
  const reliabilityWeight =
    Math.max(0, 100 - workspace.failedAgents * 20) * 0.2
  const engagementWeight =
    Math.min(100, workspace.engagementEvents * 5) * 0.2

  return Math.round(
    readinessWeight +
      replyWeight +
      reliabilityWeight +
      engagementWeight
  )
}

export function rankWorkspaces(workspaces: WorkspaceBenchmark[]) {
  return workspaces
    .map((workspace) => ({
      ...workspace,
      healthScore: calculateTenantHealthScore(workspace),
    }))
    .sort((a, b) => b.healthScore - a.healthScore)
}

export function summarizeBenchmarks(workspaces: any[]) {
  const total = workspaces.length

  return {
    totalWorkspaces: total,

    avgReadiness:
      total > 0
        ? Math.round(
            workspaces.reduce(
              (sum, item) => sum + Number(item.readinessScore || 0),
              0
            ) / total
          )
        : 0,

    avgReplyRate:
      total > 0
        ? Math.round(
            workspaces.reduce(
              (sum, item) => sum + Number(item.replyRate || 0),
              0
            ) / total
          )
        : 0,

    avgOpenRate:
      total > 0
        ? Math.round(
            workspaces.reduce(
              (sum, item) => sum + Number(item.openRate || 0),
              0
            ) / total
          )
        : 0,

    totalSignals: workspaces.reduce(
      (sum, item) => sum + Number(item.totalSignals || 0),
      0
    ),

    totalFailures: workspaces.reduce(
      (sum, item) => sum + Number(item.failedAgents || 0),
      0
    ),
  }
}
