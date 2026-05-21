import type { ExecutionPolicy } from "@/lib/orchestration/autonomous-execution-orchestrator"

export type WorkspaceAutonomousPolicy = {
  workspaceId: string
  version: string
  status: "active" | "draft" | "disabled"
  generatedAt: string
  policy: ExecutionPolicy
  governance: {
    autoApplyQueuePolicy: boolean
    autoApplySequencePolicy: boolean
    autoApplyCopyPolicy: boolean
    autoApplyDeliveryProtection: boolean
    requiresHumanApproval: boolean
  }
  audit: {
    source: "autonomous_orchestration"
    notes: string[]
  }
}

export function createWorkspaceAutonomousPolicy({
  workspaceId,
  policy,
}: {
  workspaceId: string
  policy: ExecutionPolicy
}): WorkspaceAutonomousPolicy {
  const highRisk =
    policy.deliveryPolicy.riskMode === "protective" ||
    policy.executionActions.some((action) => action.priority === "critical")

  return {
    workspaceId,
    version: "v1",
    status: "active",
    generatedAt: new Date().toISOString(),
    policy,
    governance: {
      autoApplyQueuePolicy: !highRisk,
      autoApplySequencePolicy: true,
      autoApplyCopyPolicy: true,
      autoApplyDeliveryProtection: policy.deliveryPolicy.riskMode === "protective",
      requiresHumanApproval: highRisk,
    },
    audit: {
      source: "autonomous_orchestration",
      notes: [
        "Policy generated from strategic memory, sequence learning, autonomous optimization, and execution orchestration.",
        highRisk
          ? "Critical risk detected. Human approval recommended before fully automated execution."
          : "No critical risk detected. Policy can be used for autonomous runtime guidance.",
      ],
    },
  }
}

export function summarizeWorkspacePolicy(policy: WorkspaceAutonomousPolicy) {
  return {
    workspaceId: policy.workspaceId,
    status: policy.status,
    version: policy.version,
    generatedAt: policy.generatedAt,
    queueMode: policy.policy.queuePolicy.mode,
    maxDailySends: policy.policy.queuePolicy.maxDailySends,
    minDelayHours: policy.policy.queuePolicy.minDelayHours,
    preferredSequenceLength: policy.policy.sequencePolicy.preferredLength,
    tone: policy.policy.sequencePolicy.tone,
    ctaStrength: policy.policy.sequencePolicy.ctaStrength,
    deliveryRiskMode: policy.policy.deliveryPolicy.riskMode,
    throttleEnabled: policy.policy.deliveryPolicy.throttleEnabled,
    requiresHumanApproval: policy.governance.requiresHumanApproval,
  }
}
