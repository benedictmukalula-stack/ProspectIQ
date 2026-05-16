export type UsageEventType =
  | "ai_prompts"
  | "lead_enrichments"
  | "exports"
  | "campaigns"
  | "team_members"

export async function trackUsage({
  userId,
  eventType,
  quantity = 1,
  metadata = {},
}: {
  userId: string
  eventType: UsageEventType
  quantity?: number
  metadata?: Record<string, unknown>
}) {
  const response = await fetch("/api/usage/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      eventType,
      quantity,
      metadata,
    }),
  })

  const data = await response.json()

  return {
    ok: response.ok,
    status: response.status,
    data,
  }
}
