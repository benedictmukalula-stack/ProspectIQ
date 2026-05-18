export type WorkflowExecution = {
  type: string
  title: string
  description: string
  action: string
  status: "queued" | "executed" | "skipped"
  href: string
}

export async function executeAutonomousWorkflows({
  intelligence,
  pipelineRisks = [],
  engagementSignals = [],
  executiveInsights = [],
}: {
  intelligence: any
  pipelineRisks?: any[]
  engagementSignals?: any[]
  executiveInsights?: any[]
}) {
  const executions: WorkflowExecution[] = []

  const summary = intelligence?.summary || {}
  const performance = intelligence?.performance || {}

  if (
    (summary.contacts || 0) > 0 &&
    (summary.activeSequences || 0) === 0
  ) {
    executions.push({
      type: "sequence_activation",
      title: "Activate outbound sequences",
      description:
        "Contacts exist without active outbound automation.",
      action:
        "Queue outbound sequence enrollment workflow.",
      status: "queued",
      href: "/dashboard/sequences",
    })
  }

  if (
    (performance.replyRate || 0) < 5 &&
    (summary.sentEmails || 0) > 0
  ) {
    executions.push({
      type: "reply_optimization",
      title: "Optimize reply conversion",
      description:
        "Low reply rate detected by autonomous agents.",
      action:
        "Queue AI copy optimization workflow.",
      status: "queued",
      href: "/dashboard/ai-workflows",
    })
  }

  if (
    engagementSignals.some(
      (signal: any) =>
        signal.eventType ===
        "agent.engagement.replies_need_followup"
    )
  ) {
    executions.push({
      type: "followup_tasks",
      title: "Generate follow-up tasks",
      description:
        "Replies require immediate operational follow-up.",
      action:
        "Queue automatic follow-up task generation.",
      status: "queued",
      href: "/dashboard/tasks",
    })
  }

  if (
    executiveInsights.some(
      (insight: any) =>
        insight.eventType ===
        "agent.executive.security_blocker"
    )
  ) {
    executions.push({
      type: "security_escalation",
      title: "Escalate security readiness blocker",
      description:
        "Executive agent detected security readiness risk.",
      action:
        "Generate operational security escalation event.",
      status: "queued",
      href: "/dashboard/security",
    })
  }

  if (
    executiveInsights.some(
      (insight: any) =>
        insight.eventType ===
        "agent.executive.outbound_launch_blocker"
    )
  ) {
    executions.push({
      type: "outbound_launch_blocker",
      title: "Escalate outbound readiness blocker",
      description:
        "Production outbound infrastructure remains incomplete.",
      action:
        "Trigger infrastructure readiness workflow.",
      status: "queued",
      href: "/dashboard/integrations",
    })
  }

  return executions
}
