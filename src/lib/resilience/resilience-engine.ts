export type InfrastructureRisk = {
  id: string
  title: string
  severity: "low" | "medium" | "high" | "critical"
  category: "runtime" | "security" | "deployment" | "database" | "configuration"
  impact: string
  recommendation: string
  selfHealingAvailable: boolean
  scoreImpact: number
}

export function calculateResilienceScore(risks: InfrastructureRisk[]) {
  const penalty = risks.reduce((sum, risk) => sum + risk.scoreImpact, 0)
  return Math.max(0, Math.min(100, 100 - penalty))
}

export function summarizeInfrastructureRisks(risks: InfrastructureRisk[]) {
  return {
    total: risks.length,
    critical: risks.filter((item) => item.severity === "critical").length,
    high: risks.filter((item) => item.severity === "high").length,
    medium: risks.filter((item) => item.severity === "medium").length,
    low: risks.filter((item) => item.severity === "low").length,
    selfHealingAvailable: risks.filter((item) => item.selfHealingAvailable).length,
    resilienceScore: calculateResilienceScore(risks),
  }
}
