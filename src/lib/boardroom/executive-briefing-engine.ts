type RevenueForecast = {
  summary: {
    forecastCategory: string
    conversionOutlook: string
    weightedPipelineScore: number
    engagementRate: number
    replyRate: number
    failureRate: number
    hot: number
    warm: number
    cold: number
    sent: number
    failed: number
  }
  recommendations: Array<{
    priority: "critical" | "high" | "medium" | "low"
    action: string
  }>
}

type Strategy = {
  summary: {
    strategicMode: string
    leadingVertical: string
    decisions: number
  }
  decisions: Array<{
    decision: string
    priority: "critical" | "high" | "medium" | "low"
    strategicArea: string
    rationale: string
    executionInstruction: string
  }>
}

type Mesh = {
  summary: {
    workspaces: number
    leads: number
    companies: number
    engagementRate: number
    replyRate: number
    failureRate: number
  }
  industryBenchmarks: Array<{
    industry: string
    hotRate: number
    averageScore: number
  }>
}

export function generateExecutiveBriefing({
  forecast,
  strategy,
  mesh,
}: {
  forecast: RevenueForecast
  strategy: Strategy
  mesh: Mesh
}) {
  const topVertical = mesh.industryBenchmarks[0]?.industry || "No dominant vertical"

  const boardHealth =
    forecast.summary.failureRate > 10
      ? "At Risk"
      : forecast.summary.weightedPipelineScore >= 80
        ? "Strong"
        : forecast.summary.weightedPipelineScore >= 40
          ? "Developing"
          : "Early"

  const executiveSummary =
    `ProspectIQ is currently operating in ${strategy.summary.strategicMode} mode with a ${forecast.summary.forecastCategory} revenue forecast. ` +
    `The platform is showing ${forecast.summary.engagementRate}% engagement, ${forecast.summary.replyRate}% reply rate, and ${forecast.summary.failureRate}% failure rate. ` +
    `The strongest current vertical signal is ${topVertical}.`

  const risks: Array<{
    severity: "critical" | "high" | "medium" | "low"
    risk: string
    mitigation: string
  }> = []

  if (forecast.summary.failureRate > 10) {
    risks.push({
      severity: "critical",
      risk: "Delivery failure risk",
      mitigation:
        "Activate protective delivery mode, suppress bounced contacts, and reduce outbound volume.",
    })
  }

  if (forecast.summary.hot === 0 && forecast.summary.warm === 0) {
    risks.push({
      severity: "medium",
      risk: "Weak pipeline temperature",
      mitigation:
        "Improve targeting and run AI-generated nurture campaigns to create warmer signals.",
    })
  }

  if (forecast.summary.replyRate === 0) {
    risks.push({
      severity: "medium",
      risk: "No reply conversion signal",
      mitigation:
        "Test stronger CTA copy, narrower ICP targeting, and shorter sequence structure.",
    })
  }

  if (risks.length === 0) {
    risks.push({
      severity: "low",
      risk: "No critical board-level revenue risk detected",
      mitigation:
        "Continue monitoring pipeline quality, reply behavior, and delivery health.",
    })
  }

  const executiveActions = [
    ...strategy.decisions.slice(0, 3).map((decision) => ({
      priority: decision.priority,
      action: decision.executionInstruction,
    })),
    ...forecast.recommendations.slice(0, 2),
  ]

  return {
    summary: {
      boardHealth,
      executiveSummary,
      strategicMode: strategy.summary.strategicMode,
      leadingVertical: topVertical,
      weightedPipelineScore: forecast.summary.weightedPipelineScore,
      engagementRate: forecast.summary.engagementRate,
      replyRate: forecast.summary.replyRate,
      failureRate: forecast.summary.failureRate,
      workspaces: mesh.summary.workspaces,
      leads: mesh.summary.leads,
      companies: mesh.summary.companies,
    },
    kpis: [
      {
        label: "Weighted Pipeline Score",
        value: forecast.summary.weightedPipelineScore,
        interpretation: forecast.summary.conversionOutlook,
      },
      {
        label: "Engagement Rate",
        value: `${forecast.summary.engagementRate}%`,
        interpretation: "Measures outbound interest across opens, clicks, and replies.",
      },
      {
        label: "Reply Rate",
        value: `${forecast.summary.replyRate}%`,
        interpretation: "Measures conversion from outreach to direct response.",
      },
      {
        label: "Failure Rate",
        value: `${forecast.summary.failureRate}%`,
        interpretation: "Measures delivery and operational risk.",
      },
    ],
    risks,
    executiveActions,
  }
}
