type Lead = {
  id: string
  lead_score?: number | null
  lifecycle_stage?: string | null
  hot_lead?: boolean | null
  title?: string | null
}

type Company = {
  id: string
  industry?: string | null
}

type EngagementEvent = {
  event_type?: string | null
}

type QueueItem = {
  status?: string | null
}

function percent(part: number, total: number) {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

export function generateStrategicMemory({
  leads,
  companies,
  engagementEvents,
  queue,
}: {
  leads: Lead[]
  companies: Company[]
  engagementEvents: EngagementEvent[]
  queue: QueueItem[]
}) {
  const hotLeads = leads.filter(
    (lead) => lead.hot_lead || lead.lifecycle_stage === "hot"
  )
  const warmLeads = leads.filter((lead) => lead.lifecycle_stage === "warm")
  const coldLeads = leads.filter((lead) => lead.lifecycle_stage === "cold")

  const opens = engagementEvents.filter((event) => event.event_type === "opened")
  const clicks = engagementEvents.filter((event) => event.event_type === "clicked")
  const replies = engagementEvents.filter((event) => event.event_type === "replied")
  const bounces = engagementEvents.filter((event) => event.event_type === "bounced")

  const sent = queue.filter((item) => item.status === "sent")
  const failed = queue.filter((item) => item.status === "failed")

  const industryCounts = new Map<string, number>()

  for (const company of companies) {
    const industry = company.industry || "Unknown"
    industryCounts.set(industry, (industryCounts.get(industry) || 0) + 1)
  }

  const topIndustries = Array.from(industryCounts.entries())
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const averageLeadScore =
    leads.length > 0
      ? Math.round(
          leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) /
            leads.length
        )
      : 0

  const engagementRate = percent(opens.length + clicks.length + replies.length, sent.length)
  const replyRate = percent(replies.length, sent.length)
  const failureRate = percent(failed.length + bounces.length, sent.length + failed.length)

  const learnedPatterns: Array<{
    pattern: string
    meaning: string
    recommendation: string
  }> = []

  if (replyRate > 0) {
    learnedPatterns.push({
      pattern: "Reply signal present",
      meaning:
        "At least one prospect has replied, so reply-aware stopping and manual handoff logic should remain active.",
      recommendation:
        "Prioritize replied leads for manual sales action before launching additional automated touches.",
    })
  }

  if (clicks.length > 0) {
    learnedPatterns.push({
      pattern: "Click intent detected",
      meaning:
        "Clicked messages indicate stronger buying intent than opens alone.",
      recommendation:
        "Use stronger calls-to-action for contacts with click events.",
    })
  }

  if (warmLeads.length > coldLeads.length) {
    learnedPatterns.push({
      pattern: "Warm audience developing",
      meaning:
        "The workspace has more warm leads than cold leads, suggesting early engagement quality is improving.",
      recommendation:
        "Move warm leads into value-led nurture or AI-generated follow-up sequences.",
    })
  }

  if (hotLeads.length > 0) {
    learnedPatterns.push({
      pattern: "High-intent opportunity cluster",
      meaning:
        "Hot leads exist in the workspace and should be handled as active revenue opportunities.",
      recommendation:
        "Escalate hot leads to Revenue Command Center and queue personalized AI follow-ups.",
    })
  }

  if (failureRate === 0 && sent.length > 0) {
    learnedPatterns.push({
      pattern: "Clean delivery simulation",
      meaning:
        "Current outbound execution has no delivery failures in the tested environment.",
      recommendation:
        "Maintain current queue safeguards while preparing for production email provider integration.",
    })
  }

  if (topIndustries.length > 0) {
    learnedPatterns.push({
      pattern: "Vertical context available",
      meaning: `The most represented industry is ${topIndustries[0].industry}.`,
      recommendation:
        "Use industry context in AI-generated sequences and executive recommendations.",
    })
  }

  return {
    summary: {
      leads: leads.length,
      companies: companies.length,
      hot: hotLeads.length,
      warm: warmLeads.length,
      cold: coldLeads.length,
      averageLeadScore,
      sent: sent.length,
      failed: failed.length,
      opens: opens.length,
      clicks: clicks.length,
      replies: replies.length,
      bounces: bounces.length,
      engagementRate,
      replyRate,
      failureRate,
    },
    topIndustries,
    learnedPatterns,
  }
}
