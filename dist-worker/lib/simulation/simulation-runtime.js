export function buildSimulationSummary(scenarios) {
    const positive = scenarios.filter((item) => item.impact === "positive").length;
    const negative = scenarios.filter((item) => item.impact === "negative").length;
    const avgProbability = scenarios.length > 0
        ? Math.round(scenarios.reduce((sum, item) => sum + item.probability, 0) / scenarios.length)
        : 0;
    const projectedRevenue = scenarios.reduce((sum, item) => sum +
        (item.projectedOutcome
            ?.revenueChange || 0), 0);
    return {
        totalScenarios: scenarios.length,
        positive,
        negative,
        avgProbability,
        projectedRevenueImpact: projectedRevenue,
        enterpriseReadiness: Math.max(0, Math.min(100, avgProbability +
            positive * 4 -
            negative * 6)),
    };
}
