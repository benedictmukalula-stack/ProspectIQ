type EngagementEvent = {
  event_type?: string | null
}

type LeadContext = {
  lifecycle_stage?: string | null
  lead_score?: number | null
  hot_lead?: boolean | null
}

export type AdaptiveSequenceDecision = {
  decision:
    | "stop_sequence"
    | "accelerate_followup"
    | "stronger_cta"
    | "soft_nurture"
    | "extend_cadence"
    | "continue_standard"
  priority: "critical" | "high" | "medium" | "low"
  reasoning: string
  recommendedDelayDays: number
  recommendedTone: string
  recommendedSubject: string
  recommendedBody: string
}

export function adaptSequence({
  events,
  lead,
}: {
  events: EngagementEvent[]
  lead: LeadContext
}): AdaptiveSequenceDecision {
  const eventTypes = events.map((event) => event.event_type)

  const replies = eventTypes.filter((type) => type === "replied").length
  const clicks = eventTypes.filter((type) => type === "clicked").length
  const opens = eventTypes.filter((type) => type === "opened").length
  const bounces = eventTypes.filter((type) => type === "bounced").length

  const score = lead.lead_score || 0
  const stage = lead.lifecycle_stage || "cold"

  if (replies > 0) {
    return {
      decision: "stop_sequence",
      priority: "critical",
      reasoning:
        "The contact has replied. Automated outbound should stop and manual sales follow-up should take over.",
      recommendedDelayDays: 0,
      recommendedTone: "manual sales handoff",
      recommendedSubject: "Manual follow-up recommended",
      recommendedBody:
        "This lead has replied. Pause automated messaging and assign the contact to a sales owner for direct handling.",
    }
  }

  if (bounces > 0) {
    return {
      decision: "stop_sequence",
      priority: "high",
      reasoning:
        "A bounce was detected. Continuing automation may damage sender reputation.",
      recommendedDelayDays: 0,
      recommendedTone: "delivery risk review",
      recommendedSubject: "Review recipient address",
      recommendedBody:
        "This contact generated a bounce event. Verify the email address before any further outreach.",
    }
  }

  if (clicks > 0) {
    return {
      decision: "stronger_cta",
      priority: "high",
      reasoning:
        "The contact clicked. This indicates stronger buying intent and supports a more direct call-to-action.",
      recommendedDelayDays: 1,
      recommendedTone: "direct consultative",
      recommendedSubject: "Worth a quick conversation?",
      recommendedBody:
        "Because you engaged with the previous message, I thought it may be useful to schedule a short conversation and explore where ProspectIQ could support your sales workflow.",
    }
  }

  if (opens >= 2 || score >= 30 || stage === "hot") {
    return {
      decision: "accelerate_followup",
      priority: "high",
      reasoning:
        "Repeated opens or hot-lead status indicate active interest. Follow-up should happen sooner.",
      recommendedDelayDays: 1,
      recommendedTone: "high-intent helpful",
      recommendedSubject: "Quick follow-up while this is fresh",
      recommendedBody:
        "I noticed there may be interest around ProspectIQ. The most relevant value is helping teams prioritize engaged prospects and act faster on revenue signals.",
    }
  }

  if (opens === 1 || stage === "warm") {
    return {
      decision: "soft_nurture",
      priority: "medium",
      reasoning:
        "The contact has shown light engagement. Continue with educational value rather than a hard call-to-action.",
      recommendedDelayDays: 3,
      recommendedTone: "educational nurture",
      recommendedSubject: "A useful sales intelligence idea",
      recommendedBody:
        "One practical way ProspectIQ helps is by turning engagement signals into ranked sales priorities so teams know who to follow up with first.",
    }
  }

  if (events.length === 0 || stage === "cold") {
    return {
      decision: "extend_cadence",
      priority: "low",
      reasoning:
        "There are no meaningful engagement signals yet. Extend cadence to avoid over-messaging.",
      recommendedDelayDays: 7,
      recommendedTone: "light-touch awareness",
      recommendedSubject: "Sharing this for later",
      recommendedBody:
        "I wanted to share ProspectIQ as a useful reference for improving lead prioritization, outbound visibility, and AI-guided sales execution.",
    }
  }

  return {
    decision: "continue_standard",
    priority: "medium",
    reasoning:
      "No major deviation detected. Continue with the standard sequence cadence.",
    recommendedDelayDays: 3,
    recommendedTone: "standard follow-up",
    recommendedSubject: "Following up",
    recommendedBody:
      "Just following up to see whether ProspectIQ could be relevant to your sales intelligence workflow.",
  }
}
