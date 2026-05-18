export type RevenuePrediction = {
  conversionProbability: number
  engagementForecast: number
  pipelineRiskScore: number
  anomalyScore: number
  forecastLabel: "strong" | "stable" | "at_risk" | "critical"
  recommendations: string[]
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function predictRevenueSignals({
  intelligence,
  graph,
}: {
  intelligence: any
  graph?: any
}): RevenuePrediction {
  const summary = intelligence?.summary || {}
  const performance = intelligence?.performance || {}
  const health = intelligence?.health || {}

  const graphSummary = graph?.summary || {}

  let conversionProbability = 35
  conversionProbability += Math.min(20, Number(summary.contacts || 0) * 4)
  conversionProbability += Math.min(15, Number(summary.activeSequences || 0) * 5)
  conversionProbability += Math.min(20, Number(performance.replyRate || 0) * 2)
  conversionProbability += Math.min(10, Number(summary.aiRuns || 0) * 3)
  conversionProbability += Math.min(10, Number(graphSummary.graphDensity || 0))

  let engagementForecast = 25
  engagementForecast += Math.min(35, Number(performance.openRate || 0) * 0.35)
  engagementForecast += Math.min(25, Number(performance.clickRate || 0) * 0.25)
  engagementForecast += Math.min(20, Number(summary.engagementEvents || 0) * 5)

  let pipelineRiskScore = 20
  if (health.emailProvider === "mock_mode") pipelineRiskScore += 25
  if (health.security === "review_needed") pipelineRiskScore += 20
  if ((summary.sentEmails || 0) > 0 && (performance.replyRate || 0) < 5) {
    pipelineRiskScore += 20
  }
  if ((summary.activeSequences || 0) === 0) pipelineRiskScore += 15
  if ((summary.aiRuns || 0) === 0) pipelineRiskScore += 10

  let anomalyScore = 0
  if ((performance.openRate || 0) >= 100 && (summary.sentEmails || 0) <= 1) {
    anomalyScore += 35
  }
  if ((summary.engagementEvents || 0) > (summary.sentEmails || 0) * 5) {
    anomalyScore += 25
  }
  if ((summary.teamMembers || 0) === 0) {
    anomalyScore += 10
  }
  if ((graphSummary.edges || 0) === 0 && (graphSummary.nodes || 0) > 1) {
    anomalyScore += 15
  }

  conversionProbability = clamp(conversionProbability - pipelineRiskScore * 0.2)
  engagementForecast = clamp(engagementForecast)
  pipelineRiskScore = clamp(pipelineRiskScore)
  anomalyScore = clamp(anomalyScore)

  const recommendations: string[] = []

  if (pipelineRiskScore >= 60) {
    recommendations.push("Reduce launch risk by connecting production email and completing security hardening.")
  }

  if (conversionProbability < 50) {
    recommendations.push("Increase conversion probability by improving reply quality and running AI lead-scoring workflows.")
  }

  if (engagementForecast < 50) {
    recommendations.push("Improve engagement forecast with stronger subject lines, segmentation, and clearer outbound CTA.")
  }

  if (anomalyScore >= 40) {
    recommendations.push("Review telemetry quality because engagement patterns may be distorted by sparse or duplicated data.")
  }

  let forecastLabel: RevenuePrediction["forecastLabel"] = "stable"

  if (conversionProbability >= 70 && pipelineRiskScore < 40) forecastLabel = "strong"
  if (pipelineRiskScore >= 55) forecastLabel = "at_risk"
  if (pipelineRiskScore >= 75 || anomalyScore >= 70) forecastLabel = "critical"

  return {
    conversionProbability,
    engagementForecast,
    pipelineRiskScore,
    anomalyScore,
    forecastLabel,
    recommendations,
  }
}
