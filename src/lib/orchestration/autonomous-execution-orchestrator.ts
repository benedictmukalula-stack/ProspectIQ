type OptimizationPlan = {
  cadence: "accelerate" | "standard" | "extend"
  tone: "direct" | "consultative" | "educational" | "light-touch"
  ctaStrength: "strong" | "medium" | "soft"
  sequenceLength: "short" | "standard" | "long"
  deliveryRiskMode: "normal" | "protective"
  verticalStrategy: string
  rationale: string[]
  actions?: Array<{
    type: string
    priority: string
    title: string
    description: string
  }>
}

export type ExecutionPolicy = {
  queuePolicy: {
    mode: "accelerated" | "standard" | "conservative"
    maxDailySends: number
    minDelayHours: number
  }
  sequencePolicy: {
    preferredLength: number
    tone: string
    ctaStrength: string
    cadence: string
  }
  copyPolicy: {
    style: string
    verticalInstruction: string
    requiredElements: string[]
  }
  deliveryPolicy: {
    riskMode: "normal" | "protective"
    throttleEnabled: boolean
    suppressOnBounce: boolean
  }
  executionActions: Array<{
    action: string
    priority: "critical" | "high" | "medium" | "low"
    description: string
  }>
}

export function generateExecutionPolicy(
  optimization: OptimizationPlan
): ExecutionPolicy {
  const queuePolicy =
    optimization.deliveryRiskMode === "protective"
      ? {
          mode: "conservative" as const,
          maxDailySends: 25,
          minDelayHours: 48,
        }
      : optimization.cadence === "accelerate"
        ? {
            mode: "accelerated" as const,
            maxDailySends: 150,
            minDelayHours: 12,
          }
        : optimization.cadence === "extend"
          ? {
              mode: "conservative" as const,
              maxDailySends: 50,
              minDelayHours: 72,
            }
          : {
              mode: "standard" as const,
              maxDailySends: 100,
              minDelayHours: 24,
            }

  const preferredLength =
    optimization.sequenceLength === "short"
      ? 3
      : optimization.sequenceLength === "long"
        ? 5
        : 4

  const requiredElements = [
    "personalized opening",
    "clear value proposition",
    "business outcome",
  ]

  if (optimization.ctaStrength === "strong") {
    requiredElements.push("direct meeting CTA")
  } else if (optimization.ctaStrength === "medium") {
    requiredElements.push("soft discovery CTA")
  } else {
    requiredElements.push("low-pressure educational CTA")
  }

  const executionActions = [
    {
      action: "apply_sequence_policy",
      priority: "high" as const,
      description: `Generate ${preferredLength}-step sequences using ${optimization.recipientne} tone and ${optimization.ctaStrength} CTA strength.`,
    },
    {
      action: "apply_queue_policy",
      priority:
        queuePolicy.mode === "conservative" ? ("critical" as const) : ("medium" as const),
      description: `Use ${queuePolicy.mode} queue mode with minimum ${queuePolicy.minDelayHours} hour spacing.`,
    },
    {
      action: "apply_vertical_strategy",
      priority: "medium" as const,
      description: optimization.verticalStrategy,
    },
  ]

  if (optimization.deliveryRiskMode === "protective") {
    executionActions.push({
      action: "enable_delivery_protection",
      priority: "critical" as const,
      description:
        "Throttle sends, suppress bounced contacts, and review provider health before scaling.",
    })
  }

  return {
    queuePolicy,
    sequencePolicy: {
      preferredLength,
      tone: optimization.recipientne,
      ctaStrength: optimization.ctaStrength,
      cadence: optimization.cadence,
    },
    copyPolicy: {
      style: optimization.recipientne,
      verticalInstruction: optimization.verticalStrategy,
      requiredElements,
    },
    deliveryPolicy: {
      riskMode: optimization.deliveryRiskMode,
      throttleEnabled: optimization.deliveryRiskMode === "protective",
      suppressOnBounce: true,
    },
    executionActions,
  }
}
