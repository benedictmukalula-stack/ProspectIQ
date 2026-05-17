export function classifyReply(content: string) {
  const text = content.toLowerCase()

  if (
    text.includes("interested") ||
    text.includes("let's talk") ||
    text.includes("sounds good") ||
    text.includes("book a meeting")
  ) {
    return {
      classification: "interested",
      sentiment: "positive",
      confidence: 0.93,
      summary: "Prospect showed positive buying intent and openness to further discussion.",
      suggestedAction: "Create follow-up task and prioritize lead.",
    }
  }

  if (
    text.includes("not interested") ||
    text.includes("remove me") ||
    text.includes("unsubscribe")
  ) {
    return {
      classification: "unsubscribe",
      sentiment: "negative",
      confidence: 0.98,
      summary: "Prospect requested removal or expressed disinterest.",
      suggestedAction: "Pause sequence and mark contact as unsubscribed.",
    }
  }

  if (
    text.includes("price") ||
    text.includes("pricing") ||
    text.includes("cost")
  ) {
    return {
      classification: "pricing_question",
      sentiment: "neutral",
      confidence: 0.84,
      summary: "Prospect requested pricing or commercial information.",
      suggestedAction: "Send pricing information and notify account owner.",
    }
  }

  if (
    text.includes("later") ||
    text.includes("next quarter") ||
    text.includes("not now")
  ) {
    return {
      classification: "not_now",
      sentiment: "neutral",
      confidence: 0.78,
      summary: "Prospect may be relevant later but timing is not ideal.",
      suggestedAction: "Pause outreach and schedule future follow-up.",
    }
  }

  return {
    classification: "general_reply",
    sentiment: "neutral",
    confidence: 0.55,
    summary: "General inbound reply detected.",
    suggestedAction: "Review manually.",
  }
}
