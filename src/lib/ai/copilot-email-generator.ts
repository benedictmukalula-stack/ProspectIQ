type LeadInput = {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  title?: string | null
  lead_score?: number | null
  lifecycle_stage?: string | null
  crm_companies?: {
    name?: string | null
    industry?: string | null
    domain?: string | null
  } | null
}

export function generateFollowupEmail(lead: LeadInput) {
  const firstName = lead.first_name || "there"
  const company = lead.crm_companies?.name || "your team"
  const industry = lead.crm_companies?.industry || "your market"
  const stage = lead.lifecycle_stage || "lead"
  const score = lead.lead_score || 0

  const urgency =
    stage === "sales-ready"
      ? "direct"
      : stage === "hot"
        ? "high-intent"
        : stage === "warm"
          ? "nurture"
          : "light-touch"

  const subject =
    stage === "sales-ready" || stage === "hot"
      ? `Quick follow-up for ${company}`
      : `Useful sales intelligence ideas for ${company}`

  const body = `Hi ${firstName},

I wanted to follow up because ${company} appears to be a strong fit for ProspectIQ based on recent engagement signals.

ProspectIQ helps teams improve sales intelligence by combining CRM data, outbound sequencing, lead scoring, engagement tracking, and AI-guided next actions into one operating layer.

For a ${industry} team, the main value would be:
- identifying warmer prospects faster
- prioritizing follow-ups based on engagement
- reducing manual CRM and outreach work
- giving leadership clearer visibility into pipeline activity

Based on the current engagement profile (${stage}, score ${score}), I would suggest a short conversation to see where ProspectIQ could support your sales workflow.

Would it make sense to schedule a quick call this week?

Best,
ProspectIQ Team`

  return {
    subject,
    body,
    strategy: urgency,
    reasoning: `Generated for a ${stage} lead with score ${score}. Recommended tone: ${urgency}.`,
  }
}
