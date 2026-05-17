export function calculateLeadScore(classification: string) {
  switch (classification) {
    case "interested":
      return {
        scoreDelta: 40,
        lifecycleStage: "qualified",
        hotLead: true,
        priority: "high",
      }

    case "pricing_question":
      return {
        scoreDelta: 25,
        lifecycleStage: "opportunity",
        hotLead: true,
        priority: "high",
      }

    case "not_now":
      return {
        scoreDelta: 5,
        lifecycleStage: "nurture",
        hotLead: false,
        priority: "low",
      }

    case "unsubscribe":
      return {
        scoreDelta: -50,
        lifecycleStage: "disqualified",
        hotLead: false,
        priority: "low",
      }

    default:
      return {
        scoreDelta: 0,
        lifecycleStage: "lead",
        hotLead: false,
        priority: "normal",
      }
  }
}
