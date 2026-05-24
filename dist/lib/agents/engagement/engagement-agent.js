export function analyzeEngagementSignals(intelligence) {
    const summary = intelligence?.summary || {};
    const performance = intelligence?.performance || {};
    const signals = [];
    if ((summary.engagementEvents || 0) > 0) {
        signals.push({
            title: "Engagement signals available",
            severity: "medium",
            reason: `${summary.engagementEvents} engagement events have been recorded.`,
            recommendation: "Review engaged contacts and create follow-up tasks.",
            eventType: "agent.engagement.signals_available",
            href: "/dashboard/engagement",
        });
    }
    if ((performance.openRate || 0) >= 40) {
        signals.push({
            title: "Strong open rate detected",
            severity: "low",
            reason: `Open rate is ${performance.openRate}%.`,
            recommendation: "Keep current subject-line strategy and test role-specific personalization.",
            eventType: "agent.engagement.strong_open_rate",
            href: "/dashboard/send-queue",
        });
    }
    if ((summary.sentEmails || 0) > 0 && (performance.openRate || 0) < 25) {
        signals.push({
            title: "Low open rate risk",
            severity: "medium",
            reason: `Open rate is ${performance.openRate || 0}%.`,
            recommendation: "Improve subject lines, sender identity, and first-line relevance.",
            eventType: "agent.engagement.low_open_rate",
            href: "/dashboard/engagement",
        });
    }
    if ((summary.sentEmails || 0) > 0 && (performance.replyRate || 0) < 5) {
        signals.push({
            title: "Low reply conversion risk",
            severity: "high",
            reason: `Reply rate is ${performance.replyRate || 0}%.`,
            recommendation: "Refine call-to-action, segment audience, and personalize offer by role.",
            eventType: "agent.engagement.low_reply_rate",
            href: "/dashboard/replies",
        });
    }
    if ((performance.replied || 0) > 0) {
        signals.push({
            title: "Replies require sales follow-up",
            severity: "high",
            reason: `${performance.replied} replies detected.`,
            recommendation: "Review replies and create immediate follow-up tasks.",
            eventType: "agent.engagement.replies_need_followup",
            href: "/dashboard/replies",
        });
    }
    if ((summary.sentEmails || 0) === 0 && (summary.activeSequences || 0) > 0) {
        signals.push({
            title: "Active sequences have no sent email activity",
            severity: "medium",
            reason: "Sequences are active, but no sent outbound messages were detected.",
            recommendation: "Build the send queue and simulate or connect delivery.",
            eventType: "agent.engagement.sequence_delivery_gap",
            href: "/dashboard/send-queue",
        });
    }
    return signals;
}
