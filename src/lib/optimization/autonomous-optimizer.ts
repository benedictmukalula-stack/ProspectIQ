export type OptimizationAction = {
  type: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  automationLevel: "manual" | "assisted" | "autonomous"
  target: string
  expectedImpact: number
}

export type OptimizationResult = {
  actions: OptimizationAction[]
  summary: {
    totalActions: number
    autonomousActions: number
    projectedImpact: number
  }
}

export function generateAutonomousOptimizations({
  intelligence,
  prediction,
}: {
  intelligence: any
  prediction: any
}): OptimizationResult {
  const actions: OptimizationAction[] = []

  const performance = intelligence?.performance || {}
  const summary = intelligence?.summary || {}

  if ((performance.replyRate || 0) < 10) {
    actions.push({
      type: "reply_optimization",
      title: "Optimize outbound messaging",
      description:
        "Low reply rate detected. AI should regenerate subject lines and CTA structures.",
      priority: "high",
      automationLevel: "autonomous",
      target: "outbound_sequences",
      expectedImpact: 28,
    })
  }

  if ((summary.activeSequences || 0) === 0) {
    actions.push({
      type: "sequence_activation",
      title: "Launch dormant outbound workflows",
      description:
        "No active outbound sequences detected. AI should activate recovery campaigns.",
      priority: "high",
      automationLevel: "assisted",
      target: "sequence_runtime",
      expectedImpact: 32,
    })
  }

  if ((prediction.pipelineRiskScore || 0) >= 60) {
    actions.push({
      type: "risk_mitigation",
      title: "Mitigate operational revenue risk",
      description:
        "Pipeline risk exceeds acceptable threshold. AI should prioritize infrastructure readiness workflows.",
      priority: "high",
      automationLevel: "assisted",
      target: "runtime_governance",
      expectedImpact: 35,
    })
  }

  if ((prediction.engagementForecast || 0) < 50) {
    actions.push({
      type: "engagement_recovery",
      title: "Recover outbound engagement",
      description:
        "Forecast engagement quality is weak. AI should optimize segmentation and timing.",
      priority: "medium",
      automationLevel: "autonomous",
      target: "engagement_engine",
      expectedImpact: 24,
    })
  }

  if ((prediction.conversionProbability || 0) >= 70) {
    actions.push({
      type: "conversion_acceleration",
      title: "Accelerate high-conversion opportunities",
      description:
        "High conversion probability detected. AI should prioritize follow-up execution.",
      priority: "medium",
      automationLevel: "autonomous",
      target: "pipeline_execution",
      expectedImpact: 30,
    })
  }

  return {
    actions,
    summary: {
      totalActions: actions.length,
      autonomousActions: actions.filter(
        (item) => item.automationLevel === "autonomous"
      ).length,
      projectedImpact: actions.reduce(
        (sum, item) => sum + item.expectedImpact,
        0
      ),
    },
  }
}
