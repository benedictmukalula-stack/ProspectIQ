type BriefingSummary = {
  boardHealth: string
  weightedPipelineScore: number
  engagementRate: number
  replyRate: number
  failureRate: number
  strategicMode: string
}

type SimulationSummary = {
  bestScenario: string
  riskiestScenario: string
  baseScore: number
}

type GovernanceDecision = {
  decision: string
  status: "approved" | "requires_approval" | "blocked"
  priority: "critical" | "high" | "medium" | "low"
  reason: string
  control: string
}

export function generateExecutiveGovernance({
  briefing,
  simulation,
}: {
  briefing: BriefingSummary
  simulation: SimulationSummary
}) {
  const decisions: GovernanceDecision[] = []

  if (briefing.failureRate > 10) {
    decisions.push({
      decision: "Block aggressive outbound scaling",
      status: "blocked",
      priority: "critical",
      reason: "Failure rate exceeds acceptable autonomous execution threshold.",
      control:
        "Enable delivery protection and require executive approval before further outbound scaling.",
    })
  }

  if (briefing.boardHealth === "Developing" && briefing.failureRate === 0) {
    decisions.push({
      decision: "Allow controlled growth acceleration",
      status: "approved",
      priority: "high",
      reason:
        "Pipeline is developing, engagement is strong, and no delivery failure risk is currently detected.",
      control:
        "Permit accelerated queue mode and shorter high-intent sequences under monitoring.",
    })
  }

  if (briefing.replyRate > 5) {
    decisions.push({
      decision: "Require reply-aware automation stopping",
      status: "approved",
      priority: "high",
      reason:
        "Reply rate indicates real conversion signal. Continued automation after replies should be prevented.",
      control:
        "Automatically pause sequences after reply events and escalate to manual sales handling.",
    })
  }

  if (simulation.riskiestScenario === "Delivery Risk Spike") {
    decisions.push({
      decision: "Monitor delivery-risk scenario",
      status: "requires_approval",
      priority: "medium",
      reason:
        "Simulation identifies delivery risk spike as the riskiest modeled scenario.",
      control:
        "Require review before major volume increases or provider changes.",
    })
  }

  if (simulation.bestScenario.includes("Logistics")) {
    decisions.push({
      decision: "Approve logistics vertical prioritization",
      status: "approved",
      priority: "medium",
      reason:
        "Simulation identifies logistics focus as the strongest projected outcome.",
      control:
        "Allow logistics-specific copy, benchmarks, and sequence recommendations.",
    })
  }

  if (decisions.length === 0) {
    decisions.push({
      decision: "Maintain observation mode",
      status: "requires_approval",
      priority: "low",
      reason: "No strong governance signal is available yet.",
      control:
        "Continue collecting signals before authorizing broader autonomous execution.",
    })
  }

  const blocked = decisions.filter((item) => item.status === "blocked").length
  const requiresApproval = decisions.filter(
    (item) => item.status === "requires_approval"
  ).length
  const approved = decisions.filter((item) => item.status === "approved").length

  const governanceMode =
    blocked > 0
      ? "restricted"
      : requiresApproval > 0
        ? "supervised_autonomy"
        : "approved_autonomy"

  return {
    summary: {
      governanceMode,
      approved,
      requiresApproval,
      blocked,
      autonomousExecutionAllowed: blocked === 0,
      humanApprovalRequired: blocked > 0 || requiresApproval > 0,
    },
    decisions,
  }
}
