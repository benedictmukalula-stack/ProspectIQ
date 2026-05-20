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

export type GeneratedSequenceStep = {
  stepOrder: number
  delayDays: number
  channel: "email"
  subject: string
  body: string
  strategy: string
}

export function generateSequenceForLead(lead: LeadInput) {
  const firstName = lead.first_name || "there"
  const company = lead.crm_companies?.name || "your team"
  const industry = lead.crm_companies?.industry || "your industry"
  const title = lead.title || "your role"
  const stage = lead.lifecycle_stage || "cold"
  const score = lead.lead_score || 0

  const cadence =
    stage === "sales-ready" || stage === "hot"
      ? [0, 2, 4]
      : stage === "warm"
        ? [0, 3, 7]
        : [0, 5, 10]

  const tone =
    stage === "sales-ready"
      ? "direct revenue conversation"
      : stage === "hot"
        ? "high-intent consultative"
        : stage === "warm"
          ? "value-led nurture"
          : "light educational"

  const sequenceName = `${company} ${stage} AI Outreach Sequence`

  const steps: GeneratedSequenceStep[] = [
    {
      stepOrder: 1,
      delayDays: cadence[0],
      channel: "email",
      subject: `Improving sales intelligence at ${company}`,
      strategy: "initial value proposition",
      body: `Hi ${firstName},

I wanted to reach out because ${company} looks like a strong fit for ProspectIQ.

For someone in ${title}, ProspectIQ can help improve how your team identifies warmer leads, prioritizes follow-up, and tracks outbound performance from one command layer.

The platform combines CRM intelligence, outbound sequencing, engagement scoring, and AI-guided next actions.

Would it be useful to explore how this could support your ${industry} sales workflow?`,
    },
    {
      stepOrder: 2,
      delayDays: cadence[1],
      channel: "email",
      subject: `Following up on ProspectIQ for ${company}`,
      strategy: "problem expansion",
      body: `Hi ${firstName},

Just following up.

Many teams have CRM data, outreach activity, and engagement signals spread across disconnected tools. ProspectIQ brings these signals together so leadership and sales teams can see which prospects deserve attention first.

Based on your current profile (${stage}, score ${score}), the strongest use case may be lead prioritization and next-best-action guidance.

Would a short overview be helpful?`,
    },
    {
      stepOrder: 3,
      delayDays: cadence[2],
      channel: "email",
      subject: `Final check-in`,
      strategy: "low-pressure close",
      body: `Hi ${firstName},

Last quick check-in.

If improving lead prioritization, outbound visibility, and AI-assisted follow-up is relevant for ${company}, I would be happy to share a concise walkthrough of ProspectIQ.

If now is not the right time, no problem — I can reconnect later.

Best,
ProspectIQ Team`,
    },
  ]

  return {
    sequenceName,
    tone,
    stage,
    score,
    steps,
  }
}
