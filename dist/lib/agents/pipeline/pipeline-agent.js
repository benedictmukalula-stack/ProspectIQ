export function analyzePipelineRisk(intelligence) {
    const summary = intelligence?.summary || {};
    const performance = intelligence?.performance || {};
    const risks = [];
    if ((summary.contacts || 0) > 0 && (summary.activeSequences || 0) === 0) {
        risks.push({
            title: "Pipeline has contacts but no active outbound sequences",
            severity: "high",
            reason: "Lead inventory exists but no automated outbound execution is active.",
            recommendation: "Activate outbound sequences and enroll high-fit contacts.",
            eventType: "agent.pipeline.sequence_gap",
            href: "/dashboard/sequences",
        });
    }
    if ((performance.replyRate || 0) < 5 && (summary.sentEmails || 0) > 0) {
        risks.push({
            title: "Reply conversion risk detected",
            severity: "medium",
            reason: `Reply rate is currently ${performance.replyRate || 0}%.`,
            recommendation: "Improve CTA quality, personalization, and targeting segmentation.",
            eventType: "agent.pipeline.reply_risk",
            href: "/dashboard/engagement",
        });
    }
    if ((summary.aiRuns || 0) === 0) {
        risks.push({
            title: "Pipeline lacks AI optimization activity",
            severity: "medium",
            reason: "No workflow execution detected.",
            recommendation: "Run AI lead scoring and outbound drafting workflows.",
            eventType: "agent.pipeline.ai_optimization_missing",
            href: "/dashboard/ai-workflows",
        });
    }
    if ((summary.sentEmails || 0) === 0 && (summary.contacts || 0) > 10) {
        risks.push({
            title: "Outbound inactivity detected",
            severity: "high",
            reason: "CRM contains leads but no outbound execution activity exists.",
            recommendation: "Launch outbound campaigns to activate pipeline generation.",
            eventType: "agent.pipeline.outbound_inactive",
            href: "/dashboard/campaigns",
        });
    }
    return risks;
}
