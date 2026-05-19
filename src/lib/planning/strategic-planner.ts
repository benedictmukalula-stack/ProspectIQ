export type StrategicInitiative = {
  title: string
  objective: string
  priority: "low" | "medium" | "high"
  horizon: "short_term" | "mid_term" | "long_term"
  successMetric: string
  steps: string[]
  linkedModule: string
}

export function generateStrategicInitiatives({
  prediction,
  semanticGraph,
  intelligence,
}: any): StrategicInitiative[] {
  const initiatives: StrategicInitiative[] = []

  if ((prediction?.pipelineRiskScore || 0) >= 60) {
    initiatives.push({
      title: "Reduce Revenue Execution Risk",
      objective: "Lower pipeline and operational risk before scaling outbound execution.",
      priority: "high",
      horizon: "short_term",
      successMetric: "Pipeline risk below 40%",
      steps: [
        "Complete security hardening",
        "Connect production email provider",
        "Review high-priority governance approvals",
        "Run autonomous execution runtime after fixes",
      ],
      linkedModule: "/dashboard/execution",
    })
  }

  if ((prediction?.conversionProbability || 0) < 60) {
    initiatives.push({
      title: "Improve Conversion Probability",
      objective: "Increase lead-to-reply and reply-to-opportunity conversion quality.",
      priority: "high",
      horizon: "mid_term",
      successMetric: "Conversion probability above 70%",
      steps: [
        "Run AI lead scoring workflows",
        "Segment contacts by role and intent",
        "Optimize outbound messaging",
        "Track reply quality and follow-up tasks",
      ],
      linkedModule: "/dashboard/predictions",
    })
  }

  if ((semanticGraph?.semanticHealth || 0) < 75) {
    initiatives.push({
      title: "Strengthen Semantic Knowledge Base",
      objective: "Improve entity quality, relationship confidence, and operational reasoning context.",
      priority: "medium",
      horizon: "mid_term",
      successMetric: "Semantic health above 80%",
      steps: [
        "Enrich contact records",
        "Improve company/account relationships",
        "Increase engagement signal quality",
        "Expand workflow metadata",
      ],
      linkedModule: "/dashboard/semantic",
    })
  }

  if ((intelligence?.summary?.teamMembers || 0) === 0) {
    initiatives.push({
      title: "Prepare Enterprise Collaboration Layer",
      objective: "Enable multi-user operational governance and execution ownership.",
      priority: "medium",
      horizon: "long_term",
      successMetric: "At least 2 active workspace members",
      steps: [
        "Complete team member table stability",
        "Add workspace role enforcement",
        "Invite operational users",
        "Connect approval routing to roles",
      ],
      linkedModule: "/dashboard/team",
    })
  }

  return initiatives
}
