export type AutonomousAction = {
  title: string
  category: "risk" | "opportunity" | "automation" | "security" | "growth"
  priority: "low" | "medium" | "high"
  reason: string
  recommendedAction: string
  href: string
  eventType: string
}

export function generateAutonomousActions(intelligence: any): AutonomousAction[] {
  const summary = intelligence?.summary || {}
  const performance = intelligence?.performance || {}
  const health = intelligence?.health || {}

  const actions: AutonomousAction[] = []

  if (health.security === "review_needed") {
    actions.push({
      title: "Security hardening required before launch",
      category: "security",
      priority: "high",
      reason: "Workspace security is still marked for review.",
      recommendedAction: "Enable Supabase RLS policies and verify API key isolation.",
      href: "/dashboard/security",
      eventType: "ai.security_risk_detected",
    })
  }

  if (health.emailProvider === "mock_mode") {
    actions.push({
      title: "Outbound is still running in mock mode",
      category: "risk",
      priority: "high",
      reason: "Emails can be simulated, but production delivery is not connected yet.",
      recommendedAction: "Connect Resend or Amazon SES before real outbound sending.",
      href: "/dashboard/integrations",
      eventType: "ai.email_provider_risk_detected",
    })
  }

  if ((summary.contacts || 0) > 0 && (summary.activeSequences || 0) === 0) {
    actions.push({
      title: "Contacts exist but no active sequence is running",
      category: "opportunity",
      priority: "medium",
      reason: "CRM contacts are available but outbound automation is not active.",
      recommendedAction: "Activate or create a sequence and enroll qualified contacts.",
      href: "/dashboard/sequences",
      eventType: "ai.sequence_opportunity_detected",
    })
  }

  if ((summary.sentEmails || 0) > 0 && (performance.openRate || 0) < 25) {
    actions.push({
      title: "Low open rate detected",
      category: "risk",
      priority: "medium",
      reason: `Current open rate is ${performance.openRate || 0}%.`,
      recommendedAction: "Test stronger subject lines and improve first email relevance.",
      href: "/dashboard/engagement",
      eventType: "ai.low_open_rate_detected",
    })
  }

  if ((summary.sentEmails || 0) > 0 && (performance.replyRate || 0) < 5) {
    actions.push({
      title: "Low reply rate detected",
      category: "risk",
      priority: "medium",
      reason: `Current reply rate is ${performance.replyRate || 0}%.`,
      recommendedAction: "Revise CTA, tighten value proposition, and personalize by role.",
      href: "/dashboard/send-queue",
      eventType: "ai.low_reply_rate_detected",
    })
  }

  if ((summary.aiRuns || 0) === 0) {
    actions.push({
      title: "AI workflows are underused",
      category: "automation",
      priority: "medium",
      reason: "No AI workflow runs were detected in the workspace intelligence summary.",
      recommendedAction: "Run lead scoring, email drafting, or company summary workflows.",
      href: "/dashboard/ai-workflows",
      eventType: "ai.workflow_underuse_detected",
    })
  }

  if ((summary.engagementEvents || 0) > 0) {
    actions.push({
      title: "Engagement signals are available for follow-up",
      category: "opportunity",
      priority: "medium",
      reason: `${summary.engagementEvents} engagement events are available.`,
      recommendedAction: "Create follow-up tasks for contacts showing engagement.",
      href: "/dashboard/tasks",
      eventType: "ai.engagement_opportunity_detected",
    })
  }

  return actions
}
