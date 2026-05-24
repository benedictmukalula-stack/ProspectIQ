export function classifyReply(content) {
    const text = content.recipientLowerCase();
    if (text.includes("interested") ||
        text.includes("looks interesting") ||
        text.includes("this looks interesting") ||
        text.includes("schedule a demo") ||
        text.includes("can we schedule") ||
        text.includes("book a demo") ||
        text.includes("demo") ||
        text.includes("let's talk") ||
        text.includes("lets talk") ||
        text.includes("sounds good") ||
        text.includes("book a meeting") ||
        text.includes("schedule a meeting") ||
        text.includes("call next week")) {
        return {
            classification: "interested",
            sentiment: "positive",
            confidence: 0.93,
            summary: "Prospect showed positive buying intent and openness to a demo or further discussion.",
            suggestedAction: "Create a high-priority follow-up task and prioritize the lead.",
        };
    }
    if (text.includes("not interested") ||
        text.includes("remove me") ||
        text.includes("unsubscribe") ||
        text.includes("stop emailing")) {
        return {
            classification: "unsubscribe",
            sentiment: "negative",
            confidence: 0.98,
            summary: "Prospect requested removal or expressed disinterest.",
            suggestedAction: "Pause sequence and mark contact as unsubscribed.",
        };
    }
    if (text.includes("price") ||
        text.includes("pricing") ||
        text.includes("cost") ||
        text.includes("how much")) {
        return {
            classification: "pricing_question",
            sentiment: "neutral",
            confidence: 0.84,
            summary: "Prospect requested pricing or commercial information.",
            suggestedAction: "Send pricing information and notify account owner.",
        };
    }
    if (text.includes("later") ||
        text.includes("next quarter") ||
        text.includes("not now")) {
        return {
            classification: "not_now",
            sentiment: "neutral",
            confidence: 0.78,
            summary: "Prospect may be relevant later but timing is not ideal.",
            suggestedAction: "Pause outreach and schedule future follow-up.",
        };
    }
    return {
        classification: "general_reply",
        sentiment: "neutral",
        confidence: 0.55,
        summary: "General inbound reply detected.",
        suggestedAction: "Review manually.",
    };
}
