export function buildExecutiveCouncilOpinions({ governance, forecast, strategy, simulation, briefing, commercial, }) {
    const opinions = [];
    const governanceSummary = governance?.summary || {};
    const forecastSummary = forecast?.summary || {};
    const strategySummary = strategy?.summary || {};
    const simulationSummary = simulation?.summary || {};
    const briefingSummary = briefing?.summary || {};
    const metering = commercial?.metering || commercial || {};
    opinions.push({
        agent: "Executive Agent",
        role: "Strategic Oversight",
        vote: briefingSummary.boardHealth === "At Risk"
            ? "block"
            : briefingSummary.boardHealth === "Developing"
                ? "caution"
                : "support",
        confidence: briefingSummary.boardHealth === "Developing" ? 82 : 90,
        reasoning: `Board health is ${briefingSummary.boardHealth || "unknown"}. Weighted pipeline score is ${briefingSummary.weightedPipelineScore || forecastSummary.weightedPipelineScore || 0}.`,
        recommendation: briefingSummary.boardHealth === "Developing"
            ? "Continue controlled growth acceleration while monitoring pipeline quality."
            : "Proceed under executive monitoring.",
    });
    opinions.push({
        agent: "Revenue Agent",
        role: "Growth Forecasting",
        vote: forecastSummary.forecastCategory === "at_risk"
            ? "block"
            : forecastSummary.forecastCategory === "developing"
                ? "caution"
                : "support",
        confidence: 86,
        reasoning: `Revenue forecast is ${forecastSummary.forecastCategory || "unknown"} with ${forecastSummary.engagementRate || 0}% engagement and ${forecastSummary.replyRate || 0}% reply rate.`,
        recommendation: forecastSummary.conversionOutlook ||
            "Use forecast intelligence to prioritize revenue execution.",
    });
    opinions.push({
        agent: "Governance Agent",
        role: "Policy & Approval Control",
        vote: (governanceSummary.blocked || 0) > 0
            ? "block"
            : governanceSummary.humanApprovalRequired
                ? "caution"
                : "support",
        confidence: 91,
        reasoning: `Governance mode is ${governanceSummary.governanceMode || "unknown"} with ${governanceSummary.blocked || 0} blocked and ${governanceSummary.requiresApproval || 0} requiring approval.`,
        recommendation: governanceSummary.humanApprovalRequired
            ? "Proceed with supervised autonomy and keep human approval on monitored risk areas."
            : "Governance permits autonomous execution.",
    });
    opinions.push({
        agent: "Strategy Agent",
        role: "Long-Horizon Planning",
        vote: strategySummary.strategicMode === "protective"
            ? "block"
            : strategySummary.strategicMode === "growth_acceleration"
                ? "support"
                : "caution",
        confidence: 88,
        reasoning: `Strategic mode is ${strategySummary.strategicMode || "unknown"} with leading vertical ${strategySummary.leadingVertical || "none"}.`,
        recommendation: "Align execution with the current strategic mode and strongest vertical signal.",
    });
    opinions.push({
        agent: "Simulation Agent",
        role: "Scenario & Risk Modeling",
        vote: simulationSummary.riskiestScenario === "Delivery Risk Spike"
            ? "caution"
            : "support",
        confidence: 84,
        reasoning: `Best scenario is ${simulationSummary.bestScenario || "unknown"}; riskiest scenario is ${simulationSummary.riskiestScenario || "unknown"}.`,
        recommendation: "Use simulation results to scale the strongest scenario while monitoring modeled downside risk.",
    });
    opinions.push({
        agent: "Commercial Agent",
        role: "Plan, Usage & Monetization",
        vote: metering.commercialStatus === "over_limit"
            ? "block"
            : metering.commercialStatus === "near_limit"
                ? "caution"
                : "support",
        confidence: 87,
        reasoning: `Commercial status is ${metering.commercialStatus || "unknown"} on ${metering.plan || "unknown"} plan.`,
        recommendation: metering.upgradeRecommendation ||
            "Monitor usage and entitlement health before scaling autonomous execution.",
    });
    return opinions;
}
