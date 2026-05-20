type Lead = {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  title?: string | null
  lead_score?: number | null
  hot_lead?: boolean | null
  lifecycle_stage?: string | null
}

type QueueItem = {
  id: string
  status?: string | null
  contact_id?: string | null
}

type AgentInsight = {
  agent: string
  priority: "critical" | "high" | "medium" | "low"
  title: string
  insight: string
  action: string
}

function countByStatus(items: QueueItem[], status: string) {
  return items.filter((item) => item.status === status).length
}

export function runMultiAgentRevenueSystem({
  leads,
  queue,
}: {
  leads: Lead[]
  queue: QueueItem[]
}) {
  const insights: AgentInsight[] = []

  const hotLeads = leads.filter(
    (lead) => lead.hot_lead || lead.lifecycle_stage === "hot"
  )
  const warmLeads = leads.filter((lead) => lead.lifecycle_stage === "warm")
  const coldLeads = leads.filter((lead) => lead.lifecycle_stage === "cold")
  const salesReady = leads.filter(
    (lead) => lead.lifecycle_stage === "sales-ready"
  )

  const sent = countByStatus(queue, "sent")
  const pending = countByStatus(queue, "pending")
  const failed = countByStatus(queue, "failed")

  if (salesReady.length > 0 || hotLeads.length > 0) {
    insights.push({
      agent: "SDR Agent",
      priority: salesReady.length > 0 ? "critical" : "high",
      title: "Prioritize high-intent leads",
      insight: `${salesReady.length} sales-ready and ${hotLeads.length} hot lead(s) detected.`,
      action:
        "Assign these leads to direct follow-up, generate personalized emails, or queue AI follow-ups.",
    })
  } else {
    insights.push({
      agent: "SDR Agent",
      priority: "medium",
      title: "No urgent SDR action",
      insight:
        "No hot or sales-ready leads are currently detected in the workspace.",
      action:
        "Continue running nurture campaigns and simulate/track engagement signals.",
    })
  }

  if (failed > 0 || pending > 10) {
    insights.push({
      agent: "Pipeline Risk Agent",
      priority: failed > 0 ? "high" : "medium",
      title: "Outbound execution risk detected",
      insight: `${failed} failed and ${pending} pending queue item(s) found.`,
      action:
        "Review failed delivery records, provider settings, and queue processing cadence.",
    })
  } else {
    insights.push({
      agent: "Pipeline Risk Agent",
      priority: "low",
      title: "Outbound pipeline stable",
      insight: `${sent} messages sent with ${failed} current failures.`,
      action: "Maintain current queue processing and monitor delivery metrics.",
    })
  }

  if (warmLeads.length > 0) {
    insights.push({
      agent: "Engagement Optimization Agent",
      priority: "medium",
      title: "Warm audience available for nurture",
      insight: `${warmLeads.length} warm lead(s) can be advanced with value-led messaging.`,
      action:
        "Generate nurture sequences or use educational follow-up content for these contacts.",
    })
  }

  if (coldLeads.length > warmLeads.length && coldLeads.length > 0) {
    insights.push({
      agent: "Sequence Optimization Agent",
      priority: "medium",
      title: "Cold lead volume exceeds warm engagement",
      insight:
        "Cold leads currently outnumber warm leads, suggesting room to improve targeting or messaging.",
      action:
        "Test stronger subject lines, narrower ICP criteria, and more relevant first-touch copy.",
    })
  } else {
    insights.push({
      agent: "Sequence Optimization Agent",
      priority: "low",
      title: "Sequence engagement direction acceptable",
      insight:
        "Warm or high-intent lead volume is healthy relative to cold contacts.",
      action:
        "Continue monitoring lifecycle movement and optimize based on replies/clicks.",
    })
  }

  const averageScore =
    leads.length > 0
      ? Math.round(
          leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) /
            leads.length
        )
      : 0

  insights.push({
    agent: "Executive Intelligence Agent",
    priority: hotLeads.length > 0 ? "high" : "medium",
    title: "Workspace revenue intelligence summary",
    insight: `Average lead score is ${averageScore}. Current mix: ${hotLeads.length} hot, ${warmLeads.length} warm, ${coldLeads.length} cold.`,
    action:
      "Use the command center to focus sales activity on the highest-scored contacts and strongest engagement signals.",
  })

  return {
    summary: {
      totalLeads: leads.length,
      salesReady: salesReady.length,
      hot: hotLeads.length,
      warm: warmLeads.length,
      cold: coldLeads.length,
      sent,
      pending,
      failed,
      averageScore,
    },
    insights,
  }
}
