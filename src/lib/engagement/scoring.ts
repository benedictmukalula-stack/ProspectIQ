export type EngagementEventType =
  | "opened"
  | "clicked"
  | "replied"
  | "bounced"
  | "complained"
  | "sent"
  | "delivered"
  | "failed"

export const ENGAGEMENT_SCORE_WEIGHTS: Record<string, number> = {
  opened: 5,
  clicked: 15,
  replied: 40,
  bounced: -100,
  complained: -100,
  sent: 1,
  delivered: 2,
  failed: -20,
}

export function calculateEngagementScore(events: Array<{ type?: string | null }>) {
  return events.reduce((score, event) => {
    return score + (ENGAGEMENT_SCORE_WEIGHTS[event.type || ""] || 0)
  }, 0)
}

export function classifyLeadTemperature(score: number) {
  if (score >= 60) return "sales-ready"
  if (score >= 30) return "hot"
  if (score >= 10) return "warm"
  return "cold"
}
