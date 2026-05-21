export function calculateCouncilConsensus(opinions: any[]) {
  const support = opinions.filter((item) => item.vote === "support").length
  const caution = opinions.filter((item) => item.vote === "caution").length
  const block = opinions.filter((item) => item.vote === "block").length
  const total = opinions.length || 1

  const consensusScore = Math.round((support / total) * 100)

  const decision =
    block > 0
      ? "hold"
      : support >= caution
        ? "proceed"
        : "supervise"

  return {
    decision,
    consensusScore,
    support,
    caution,
    block,
  }
}
