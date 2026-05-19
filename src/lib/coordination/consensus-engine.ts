export function calculateCouncilConsensus(opinions: any[]) {
  const total = opinions.length || 1

  const support = opinions.filter((item) => item.position === "support").length
  const caution = opinions.filter((item) => item.position === "caution").length
  const block = opinions.filter((item) => item.position === "block").length

  const avgConfidence = Math.round(
    opinions.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / total
  )

  const consensusScore = Math.max(
    0,
    Math.min(100, Math.round((support / total) * 100 - block * 20))
  )

  let decision: "proceed" | "proceed_with_caution" | "hold" = "proceed_with_caution"

  if (block > 0) decision = "hold"
  else if (support / total >= 0.75) decision = "proceed"

  return {
    support,
    caution,
    block,
    avgConfidence,
    consensusScore,
    decision,
  }
}
