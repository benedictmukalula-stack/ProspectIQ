import type { WorkspaceAutonomousPolicy } from "../lib/policies/persistent-policy-engine"

export type RuntimeEnforcementState = {
  workspaceId: string
  active: boolean
  queue: {
    mode: string
    maxDailySends: number
    minDelayHours: number
    canAccelerate: boolean
  }
  sequence: {
    preferredLength: number
    cadence: string
    tone: string
    ctaStrength: string
  }
  copy: {
    style: string
    verticalInstruction: string
    requiredElements: string[]
  }
  delivery: {
    throttleEnabled: boolean
    suppressOnBounce: boolean
    riskMode: string
  }
  enforcementActions: Array<{
    action: string
    enabled: boolean
    description: string
  }>
}

export function enforceRuntimePolicy(
  workspacePolicy: WorkspaceAutonomousPolicy
): RuntimeEnforcementState {
  const policy = workspacePolicy.policy

  return {
    workspaceId: workspacePolicy.workspaceId,
    active: workspacePolicy.status === "active",
    queue: {
      mode: policy.queuePolicy.mode,
      maxDailySends: policy.queuePolicy.maxDailySends,
      minDelayHours: policy.queuePolicy.minDelayHours,
      canAccelerate:
        workspacePolicy.governance.autoApplyQueuePolicy &&
        policy.queuePolicy.mode === "accelerated",
    },
    sequence: {
      preferredLength: policy.sequencePolicy.preferredLength,
      cadence: policy.sequencePolicy.cadence,
      tone: policy.sequencePolicy.recipientne,
      ctaStrength: policy.sequencePolicy.ctaStrength,
    },
    copy: {
      style: policy.copyPolicy.style,
      verticalInstruction: policy.copyPolicy.verticalInstruction,
      requiredElements: policy.copyPolicy.requiredElements,
    },
    delivery: {
      throttleEnabled: policy.deliveryPolicy.throttleEnabled,
      suppressOnBounce: policy.deliveryPolicy.suppressOnBounce,
      riskMode: policy.deliveryPolicy.riskMode,
    },
    enforcementActions: [
      {
        action: "queue_governance",
        enabled: workspacePolicy.governance.autoApplyQueuePolicy,
        description: `Apply ${policy.queuePolicy.mode} queue mode with ${policy.queuePolicy.minDelayHours} hour minimum delay.`,
      },
      {
        action: "sequence_governance",
        enabled: workspacePolicy.governance.autoApplySequencePolicy,
        description: `Generate ${policy.sequencePolicy.preferredLength}-step sequences using ${policy.sequencePolicy.recipientne} tone.`,
      },
      {
        action: "copy_governance",
        enabled: workspacePolicy.governance.autoApplyCopyPolicy,
        description: policy.copyPolicy.verticalInstruction,
      },
      {
        action: "delivery_protection",
        enabled: workspacePolicy.governance.autoApplyDeliveryProtection,
        description: `Delivery risk mode is ${policy.deliveryPolicy.riskMode}.`,
      },
    ],
  }
}

export function applyRuntimeDelay({
  baseDelayDays,
  enforcement,
}: {
  baseDelayDays: number
  enforcement: RuntimeEnforcementState
}) {
  if (!enforcement.active) return baseDelayDays

  if (enforcement.queue.mode === "accelerated") {
    return Math.max(0, Math.min(baseDelayDays, 1))
  }

  if (enforcement.queue.mode === "conservative") {
    return Math.max(baseDelayDays, 3)
  }

  return baseDelayDays
}

export function applyRuntimeSequenceLength({
  requestedLength,
  enforcement,
}: {
  requestedLength: number
  enforcement: RuntimeEnforcementState
}) {
  if (!enforcement.active) return requestedLength

  return enforcement.sequence.preferredLength
}
