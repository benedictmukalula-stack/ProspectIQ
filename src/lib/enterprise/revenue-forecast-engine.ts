type Lead = {
  id: string
  lead_score?: number | null
  lifecycle_stage?: string | null
  hot_lead?: boolean | null
}

type QueueItem = {
  status?: string | null
}

type EngagementEvent = {
  event_type?: string | null
}

function percent(part: number, total: number) {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

export function generateRevenueForecast({
  leads,
  queue,
  engagementEvents,
}: {
  leads: Lead[]
  queue: QueueItem[]
  engagementEvents: EngagementEvent[]
}) {
  const hot = leads.filter(
    (lead) => lead.hot_lead || lead.lifecycle_stage === "hot"
  ).length

  const warm = leads.filter((lead) => lead.lifecycle_stage === "warm").length
  const cold = leads.filter((lead) => lead.lifecycle_stage === "cold").length
  const salesReady = leads.filter(
    (lead) => lead.lifecycle_stage === "sales-ready"
  ).length

  const sent = queue.filter((item) => item.status === "sent").length
  const failed = queue.filter((item) => item.status === "failed").length
  const pending = queue.filter((item) => item.status === "pending").length

  const opens = engagementEvents.filter((event) => event.event_type === "opened").length
  const clicks = engagementEvents.filter((event) => event.event_type === "clicked").length
  const replies = engagementEvents.filter((event) => event.event_type === "replied").length

  const averageScore =
    leads.length > 0
      ? Math.round(
          leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) /
            leads.length
        )
      : 0

  const engagementRate = percent(opens + clicks + replies, sent)
  const replyRate = percent(replies, sent)
  const failureRate = percent(failed, sent + failed)

  const weightedPipelineScore =
    salesReady * 40 + hot * 25 + warm * 10 + averageScore

  const forecastCategory =
    failureRate > 10
      ? "at_risk"
      : weightedPipelineScore >= 80
        ? "strong"
        : weightedPipelineScore >= 40
          ? "developing"
          : "early"

  const conversionOutlook =
    forecastCategory === "strong"
      ? "High near-term conversion potential"
      : forecastCategory === "developing"
        ? "Moderate conversion potential with follow-up required"
        : forecastCategory === "at_risk"
          ? "Execution risk may reduce conversion potential"
          : "Early-stage pipeline needs more engagement"

  const recommendations: Array<{
    priority: "critical" | "high" | "medium" | "low"
    action: string
  }> = []

  if (hot + salesReady > 0) {
    recommendations.push({
      priority: "high",
      action: "Prioritize hot and sales-ready leads for direct follow-up.",
    })
  }

  if (warm > 0) {
    recommendations.push({
      priority: "medium",
      action: "Move warm leads into value-led nurture sequences.",
    })
  }

  if (failureRate > 10) {
    recommendations.push({
      priority: "critical",
      action: "Pause aggressive outbound and inspect delivery health.",
    })
  }

  if (pending > 0) {
    recommendations.push({
      priority: "medium",
      action: "Process pending queue items or apply runtime queue governance.",
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: "low",
      action: "Continue collecting engagement and scoring signals.",
    })
  }

  return {
    summary: {
      leads: leads.length,
      salesReady,
      hot,
      warm,
      cold,
      sent,
      pending,
      failed,
      opens,
      clicks,
      replies,
      averageScore,
      engagementRate,
      replyRate,
      failureRate,
      weightedPipelineScore,
      forecastCategory,
      conversionOutlook,
    },
    recommendations,
  }
}
