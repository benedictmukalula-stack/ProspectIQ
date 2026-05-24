export function generateAutonomousStrategicDecisions({ directives, leadingVertical, engagementRate, replyRate, failureRate, }) {
    const decisions = [];
    if (failureRate > 10) {
        decisions.push({
            decision: "Shift platform into protective outbound mode",
            priority: "critical",
            strategicArea: "delivery_governance",
            rationale: "Failure rate is elevated. Protecting deliverability should override growth acceleration.",
            executionInstruction: "Activate delivery protection, extend cadence, suppress bounced contacts, and require review before scaling sends.",
        });
    }
    if (leadingVertical && leadingVertical !== "none") {
        decisions.push({
            decision: `Prioritize ${leadingVertical} as the current strategic vertical`,
            priority: "high",
            strategicArea: "vertical_focus",
            rationale: `${leadingVertical} is showing the strongest current platform performance signal.`,
            executionInstruction: `Increase ${leadingVertical}-specific copy, sequence examples, benchmarks, and AI recommendations.`,
        });
    }
    if (replyRate > 5) {
        decisions.push({
            decision: "Make reply-aware stopping a strategic default",
            priority: "high",
            strategicArea: "outbound_posture",
            rationale: "Reply rate is strong enough to justify prioritizing human handoff over continued automation.",
            executionInstruction: "Automatically pause sequences after replies and escalate contacts to manual sales handling.",
        });
    }
    if (engagementRate >= 50) {
        decisions.push({
            decision: "Adopt shorter high-intent sequence strategy",
            priority: "high",
            strategicArea: "sequence_strategy",
            rationale: "Platform engagement is strong. Shorter sequences with stronger CTAs should improve speed-to-conversion.",
            executionInstruction: "Default high-performing segments to 3-step sequences with accelerated cadence and strong CTAs.",
        });
    }
    const directToneSignals = directives.filter((directive) => directive.tuning.recipientne === "direct").length;
    if (directToneSignals >= 1) {
        decisions.push({
            decision: "Increase direct-tone copy weighting",
            priority: "medium",
            strategicArea: "copy_strategy",
            rationale: "Self-improvement directives are favoring direct tone for high-intent revenue activity.",
            executionInstruction: "Use direct, executive-style copy for hot leads and high-engagement verticals.",
        });
    }
    if (decisions.length === 0) {
        decisions.push({
            decision: "Maintain conservative learning posture",
            priority: "low",
            strategicArea: "outbound_posture",
            rationale: "No strong strategic signal is available yet.",
            executionInstruction: "Continue collecting engagement, delivery, and lifecycle data before changing global strategy.",
        });
    }
    return {
        summary: {
            decisions: decisions.length,
            leadingVertical: leadingVertical || "none",
            engagementRate,
            replyRate,
            failureRate,
            strategicMode: failureRate > 10
                ? "protective"
                : engagementRate >= 50
                    ? "growth_acceleration"
                    : "learning",
        },
        decisions,
    };
}
