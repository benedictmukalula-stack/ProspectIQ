export function analyzeExecutiveWorkspace({ intelligence, pipelineRisks = [], engagementSignals = [], autonomousActions = [], }) {
    const summary = intelligence?.summary || {};
    const health = intelligence?.health || {};
    const performance = intelligence?.performance || {};
    const insights = [];
    const highRiskCount = [
        ...pipelineRisks,
        ...engagementSignals,
        ...autonomousActions,
    ].filter((item) => item.severity === "high" || item.priority === "high").length;
    if (highRiskCount > 0) {
        insights.push({
            title: "Executive risk escalation required",
            severity: "high",
            category: "risk",
            summary: `${highRiskCount} high-priority operational issues were detected across agents.`,
            recommendation: "Review security, outbound readiness, and pipeline execution risks immediately.",
            eventType: "agent.executive.high_risk_escalation",
            href: "/dashboard/notifications",
        });
    }
    if (health.security === "review_needed") {
        insights.push({
            title: "Security is blocking production readiness",
            severity: "high",
            category: "security",
            summary: "Workspace security remains marked for review.",
            recommendation: "Prioritize Supabase RLS policies, webhook validation, and service-key isolation.",
            eventType: "agent.executive.security_blocker",
            href: "/dashboard/security",
        });
    }
    if (health.emailProvider === "mock_mode") {
        insights.push({
            title: "Outbound infrastructure is not production-ready",
            severity: "high",
            category: "readiness",
            summary: "Email delivery is still operating in mock mode.",
            recommendation: "Connect Resend or Amazon SES before activating real outbound campaigns.",
            eventType: "agent.executive.outbound_launch_blocker",
            href: "/dashboard/integrations",
        });
    }
    if ((summary.contacts || 0) > 0 && (summary.activeSequences || 0) > 0) {
        insights.push({
            title: "Revenue engine foundation is active",
            severity: "low",
            category: "growth",
            summary: "Contacts and active sequences are present in the workspace.",
            recommendation: "Increase engagement tracking depth and move outbound delivery into production.",
            eventType: "agent.executive.revenue_engine_active",
            href: "/dashboard/sequences",
        });
    }
    if ((summary.aiRuns || 0) === 0) {
        insights.push({
            title: "AI workflow adoption is low",
            severity: "medium",
            category: "operations",
            summary: "No AI workflow runs were detected.",
            recommendation: "Run lead scoring and outbound drafting workflows to increase operational intelligence.",
            eventType: "agent.executive.ai_adoption_gap",
            href: "/dashboard/ai-workflows",
        });
    }
    if ((performance.replyRate || 0) > 0 && (performance.replyRate || 0) < 5) {
        insights.push({
            title: "Reply conversion requires executive attention",
            severity: "medium",
            category: "growth",
            summary: `Reply rate is currently ${performance.replyRate}%.`,
            recommendation: "Improve offer positioning, segmentation, and follow-up timing.",
            eventType: "agent.executive.reply_conversion_attention",
            href: "/dashboard/engagement",
        });
    }
    return insights;
}
export function calculateExecutiveReadinessScore({ intelligence, insights, }) {
    const summary = intelligence?.summary || {};
    const health = intelligence?.health || {};
    let score = 50;
    if (summary.contacts > 0)
        score += 8;
    if (summary.activeSequences > 0)
        score += 8;
    if (summary.sentEmails > 0)
        score += 8;
    if (summary.engagementEvents > 0)
        score += 8;
    if (summary.aiWorkflows > 0)
        score += 8;
    if (summary.teamMembers > 0)
        score += 5;
    if (health.emailProvider === "mock_mode")
        score -= 12;
    if (health.security === "review_needed")
        score -= 15;
    score -= insights.filter((item) => item.severity === "high").length * 5;
    score -= insights.filter((item) => item.severity === "medium").length * 2;
    return Math.max(0, Math.min(100, score));
}
