export type RiskItem = {
  id: string
  title: string
  severity: "low" | "medium" | "high" | "critical"
  category: string
  score: number
  impact: string
  recommendation: string
  resolutionPath: string
  automated: boolean
}

export type RiskAssessment = {
  risks: RiskItem[]
  summary: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    operationalRiskScore: number
  }
}

export function generateRiskAssessment({
  intelligence,
  prediction,
  governance,
  runtime,
}: any): RiskAssessment {
  const risks: RiskItem[] = []

  if (
    intelligence?.health?.emailProvider === "mock_mode"
  ) {
    risks.push({
      id: "email_provider_mock",
      title: "Production email provider not configured",
      severity: "critical",
      category: "infrastructure",
      score: 92,
      impact:
        "Outbound execution cannot scale reliably in production.",
      recommendation:
        "Connect Resend, SendGrid, or AWS SES production infrastructure.",
      resolutionPath: "/dashboard/integrations",
      automated: false,
    })
  }

  if (
    intelligence?.health?.security ===
    "review_needed"
  ) {
    risks.push({
      id: "security_review",
      title: "Security governance review pending",
      severity: "high",
      category: "governance",
      score: 78,
      impact:
        "Operational runtime may not meet enterprise readiness standards.",
      recommendation:
        "Enable RLS hardening, secret rotation, and governance enforcement.",
      resolutionPath: "/dashboard/governance",
      automated: false,
    })
  }

  if (
    (prediction?.pipelineRiskScore || 0) >= 70
  ) {
    risks.push({
      id: "pipeline_risk",
      title: "Pipeline instability detected",
      severity: "critical",
      category: "revenue",
      score: prediction.pipelineRiskScore,
      impact:
        "Revenue execution quality is unstable and conversion confidence is weak.",
      recommendation:
        "Improve outbound quality, segmentation, and engagement optimization.",
      resolutionPath: "/dashboard/predictions",
      automated: true,
    })
  }

  if (
    (prediction?.conversionProbability || 0) < 60
  ) {
    risks.push({
      id: "conversion_efficiency",
      title: "Low conversion confidence",
      severity: "medium",
      category: "optimization",
      score: 62,
      impact:
        "Lead-to-opportunity execution efficiency is below target.",
      recommendation:
        "Optimize AI sequences and improve qualification workflows.",
      resolutionPath: "/dashboard/execution",
      automated: true,
    })
  }

  if ((runtime?.failedAgents || 0) > 0) {
    risks.push({
      id: "runtime_failures",
      title: "Autonomous agent failures detected",
      severity: "high",
      category: "runtime",
      score: 74,
      impact:
        "Operational runtime reliability is degraded.",
      recommendation:
        "Review orchestration logs and stabilize failed agents.",
      resolutionPath: "/dashboard/observability",
      automated: false,
    })
  }

  const summary = {
    total: risks.length,
    critical: risks.filter(
      (r) => r.severity === "critical"
    ).length,
    high: risks.filter(
      (r) => r.severity === "high"
    ).length,
    medium: risks.filter(
      (r) => r.severity === "medium"
    ).length,
    low: risks.filter(
      (r) => r.severity === "low"
    ).length,
    operationalRiskScore:
      risks.length > 0
        ? Math.round(
            risks.reduce(
              (sum, risk) => sum + risk.score,
              0
            ) / risks.length
          )
        : 0,
  }

  return {
    risks,
    summary,
  }
}
