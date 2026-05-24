function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(value)));
}
export function generateExecutiveSimulations(forecast) {
    const scenarios = [];
    scenarios.push({
        name: "Double Outbound Volume",
        description: "Models the impact of doubling outbound activity while keeping current engagement quality.",
        projectedScore: clamp(forecast.weightedPipelineScore + 10),
        projectedEngagementRate: clamp(forecast.engagementRate - 5),
        projectedReplyRate: clamp(forecast.replyRate - 2),
        projectedFailureRate: clamp(forecast.failureRate + 3),
        expectedOutcome: "Higher reach may increase pipeline volume, but engagement quality could decline slightly.",
        recommendation: "Scale outbound gradually and monitor reply/failure rates before doubling volume fully.",
    });
    scenarios.push({
        name: "Shorten Sequences to 3 Steps",
        description: "Models performance if all high-intent sequences use shorter, direct 3-step cadence.",
        projectedScore: clamp(forecast.weightedPipelineScore + 12),
        projectedEngagementRate: clamp(forecast.engagementRate + 4),
        projectedReplyRate: clamp(forecast.replyRate + 3),
        projectedFailureRate: clamp(forecast.failureRate),
        expectedOutcome: "Shorter sequences may improve speed-to-response for warm and hot leads.",
        recommendation: "Apply 3-step direct sequences to hot, warm, and high-engagement vertical segments.",
    });
    scenarios.push({
        name: "Delivery Risk Spike",
        description: "Models a negative scenario where delivery failures rise due to provider or list quality issues.",
        projectedScore: clamp(forecast.weightedPipelineScore - 20),
        projectedEngagementRate: clamp(forecast.engagementRate - 15),
        projectedReplyRate: clamp(forecast.replyRate - 5),
        projectedFailureRate: clamp(forecast.failureRate + 20),
        expectedOutcome: "Revenue performance could drop materially if delivery quality weakens.",
        recommendation: "Activate protective throttling, validate addresses, and suppress bounced contacts immediately.",
    });
    scenarios.push({
        name: "Vertical Focus: Logistics",
        description: "Models the impact of concentrating AI copy, sequences, and benchmarks around the strongest vertical.",
        projectedScore: clamp(forecast.weightedPipelineScore + 15),
        projectedEngagementRate: clamp(forecast.engagementRate + 6),
        projectedReplyRate: clamp(forecast.replyRate + 4),
        projectedFailureRate: clamp(forecast.failureRate),
        expectedOutcome: "Focused vertical messaging may increase relevance and conversion probability.",
        recommendation: "Increase logistics-specific messaging, case examples, and executive sequence personalization.",
    });
    scenarios.push({
        name: "Protective Conservative Mode",
        description: "Models a conservative operating posture designed to protect deliverability and reduce risk.",
        projectedScore: clamp(forecast.weightedPipelineScore - 5),
        projectedEngagementRate: clamp(forecast.engagementRate + 2),
        projectedReplyRate: clamp(forecast.replyRate + 1),
        projectedFailureRate: clamp(forecast.failureRate - 5),
        expectedOutcome: "Lower volume may reduce near-term pipeline growth but improve quality and delivery safety.",
        recommendation: "Use this mode only when bounce/failure signals increase or provider reputation is uncertain.",
    });
    const bestScenario = scenarios
        .slice()
        .sort((a, b) => b.projectedScore - a.projectedScore)[0];
    const riskiestScenario = scenarios
        .slice()
        .sort((a, b) => b.projectedFailureRate - a.projectedFailureRate)[0];
    return {
        summary: {
            baseScore: forecast.weightedPipelineScore,
            scenarios: scenarios.length,
            bestScenario: bestScenario.name,
            riskiestScenario: riskiestScenario.name,
        },
        scenarios,
    };
}
