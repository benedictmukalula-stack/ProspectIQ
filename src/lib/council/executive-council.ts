import { QUEUE_STATUS } from "@/lib/queue/status";
export type CouncilOpinion = {
  agent: string
  role: string
  position: "support" | "caution" | "block"
  confidence: number
  reasoning: string
  recommendation: string
}

export function generateExecutiveCouncil({
  prediction,
  strategy,
  governance,
  semantic,
}: any): CouncilOpinion[] {
  const opinions: CouncilOpinion[] = []

  const pipelineRisk = prediction?.pipelineRiskScore || 0
  const conversion = prediction?.conversionProbability || 0
  const strategicReadiness = strategy?.summary?.strategicReadiness || 0
  const pendingApprovals = governance?.approvals?.filter?.((item: any) => item.status === QUEUE_STATUS.PENDING).length || 0
  const semanticHealth = semantic?.semanticGraph?.semanticHealth || 0

  opinions.push({
    agent: "Executive Agent",
    role: "Strategic Oversight",
    position: pipelineRisk >= 70 ? "block" : pipelineRisk >= 50 ? "caution" : "support",
    confidence: 88,
    reasoning: `Pipeline risk is ${pipelineRisk}%.`,
    recommendation:
      pipelineRisk >= 50
        ? "Prioritize risk reduction before scaling outbound execution."
        : "Proceed with controlled revenue execution.",
  })

  opinions.push({
    agent: "Revenue Agent",
    role: "Growth Forecasting",
    position: conversion >= 65 ? "support" : "caution",
    confidence: 82,
    reasoning: `Conversion probability is ${conversion}%.`,
    recommendation:
      conversion >= 65
        ? "Accelerate high-probability revenue motions."
        : "Improve conversion inputs before aggressive scaling.",
  })

  opinions.push({
    agent: "Governance Agent",
    role: "Policy & Approval Control",
    position: pendingApprovals > 3 ? "caution" : "support",
    confidence: 91,
    reasoning: `${pendingApprovals} approval requests are pending.`,
    recommendation:
      pendingApprovals > 0
        ? "Resolve pending approvals to reduce execution friction."
        : "Governance queue is clear enough for normal execution.",
  })

  opinions.push({
    agent: "Knowledge Agent",
    role: "Semantic Intelligence",
    position: semanticHealth >= 75 ? "support" : "caution",
    confidence: 79,
    reasoning: `Semantic health is ${semanticHealth}%.`,
    recommendation:
      semanticHealth >= 75
        ? "Semantic context is strong enough for reasoning workflows."
        : "Improve entity quality and relationship coverage.",
  })

  opinions.push({
    agent: "Strategy Agent",
    role: "Long-Horizon Planning",
    position: strategicReadiness >= 70 ? "support" : "caution",
    confidence: 84,
    reasoning: `Strategic readiness is ${strategicReadiness}%.`,
    recommendation:
      strategicReadiness >= 70
        ? "Strategic plan is viable for execution."
        : "Focus on high-priority initiatives before expansion.",
  })

  return opinions
}