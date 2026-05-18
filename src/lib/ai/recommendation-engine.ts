type Intelligence = {
  summary?: any
  performance?: any
  health?: any
}

export type WorkspaceRecommendation = {
  title: string
  priority: "low" | "medium" | "high"
  category: string
  action: string
  href: string
}

export function generateWorkspaceRecommendations(intelligence: Intelligence) {
  const summary = intelligence.summary || {}
  const performance = intelligence.performance || {}
  const health = intelligence.health || {}

  const recommendations: WorkspaceRecommendation[] = []

  if ((summary.contacts || 0) === 0) {
    recommendations.push({
      title: "Add CRM contacts",
      priority: "high",
      category: "crm",
      action: "Import or create contacts before launching outbound campaigns.",
      href: "/dashboard/crm",
    })
  }

  if ((summary.activeSequences || 0) === 0) {
    recommendations.push({
      title: "Activate outbound sequences",
      priority: "high",
      category: "outbound",
      action: "Create or activate a sequence so qualified contacts can be enrolled.",
      href: "/dashboard/sequences",
    })
  }

  if ((summary.sentEmails || 0) > 0 && (performance.openRate || 0) < 25) {
    recommendations.push({
      title: "Improve email subject lines",
      priority: "medium",
      category: "engagement",
      action: "Open rate is low. Test sharper subject lines and tighter first-step messaging.",
      href: "/dashboard/engagement",
    })
  }

  if ((summary.sentEmails || 0) > 0 && (performance.replyRate || 0) < 5) {
    recommendations.push({
      title: "Strengthen outbound offer",
      priority: "medium",
      category: "outbound",
      action: "Reply rate is low. Adjust the call-to-action and personalize by role or industry.",
      href: "/dashboard/send-queue",
    })
  }

  if (health.emailProvider === "mock_mode") {
    recommendations.push({
      title: "Connect production email provider",
      priority: "high",
      category: "infrastructure",
      action: "Replace mock delivery with Resend or Amazon SES before production launch.",
      href: "/dashboard/integrations",
    })
  }

  if (health.security === "review_needed") {
    recommendations.push({
      title: "Harden workspace security",
      priority: "high",
      category: "security",
      action: "Enable Supabase RLS policies and verify API key protection before launch.",
      href: "/dashboard/security",
    })
  }

  if ((summary.aiRuns || 0) === 0) {
    recommendations.push({
      title: "Run AI workflows",
      priority: "medium",
      category: "ai",
      action: "Run lead scoring or email drafting workflows to generate operational intelligence.",
      href: "/dashboard/ai-workflows",
    })
  }

  return recommendations
}

export function generateExecutiveSummary(intelligence: Intelligence) {
  const summary = intelligence.summary || {}
  const performance = intelligence.performance || {}

  return {
    headline: "Workspace intelligence summary",
    narrative: `ProspectIQ is tracking ${summary.contacts || 0} CRM contacts, ${summary.sequences || 0} outbound sequences, ${summary.sentEmails || 0} sent emails, and ${summary.aiWorkflows || 0} AI workflows. Current open rate is ${performance.openRate || 0}% and reply rate is ${performance.replyRate || 0}%.`,
    focus:
      (summary.sentEmails || 0) === 0
        ? "Focus next on enrolling contacts and sending the first production-ready sequence."
        : "Focus next on improving engagement quality and converting responses into pipeline actions.",
  }
}
