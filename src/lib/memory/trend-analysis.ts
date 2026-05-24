export function calculateDelta(current: number, previous: number) {
  return current - previous
}

export function classifyTrend(delta: number) {
  if (delta > 0) return "improving"
  if (delta < 0) return "declining"
  return "stable"
}

export function analyzeRuntimeTrend(current: any, previous: any | null) {
  if (!previous) {
    return {
      status: "baseline",
      summary: "First runtime snapshot captured.",
      deltas: {},
    }
  }

  const deltas = {
    contacts: calculateDelta(current.contacts_count || 0, previous.contacts_count || 0),
    sentEmails: calculateDelta(current.sent_emails || 0, previous.sent_emails || 0),
    engagementEvents: calculateDelta(current.engagement_events || 0, previous.engagement_events || 0),
    openRate: calculateDelta(current.open_rate || 0, previous.open_rate || 0),
    clickRate: calculateDelta(current.click_rate || 0, previous.click_rate || 0),
    replyRate: calculateDelta(current.reply_rate || 0, previous.reply_rate || 0),
    readinessScore: calculateDelta(current.readiness_score || 0, previous.readiness_score || 0),
    totalSignals: calculateDelta(current.recipienttal_signals || 0, previous.recipienttal_signals || 0),
    failedAgents: calculateDelta(current.failed_agents || 0, previous.failed_agents || 0),
  }

  return {
    status: "compared",
    summary: "Runtime snapshot compared against previous cycle.",
    deltas,
    trends: {
      engagement: classifyTrend(deltas.engagementEvents),
      replyRate: classifyTrend(deltas.replyRate),
      readiness: classifyTrend(deltas.readinessScore),
      reliability: classifyTrend(-deltas.failedAgents),
      riskLoad: classifyTrend(-deltas.recipienttalSignals),
    },
  }
}
