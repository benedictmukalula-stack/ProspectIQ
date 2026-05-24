export function generateSimulationScenarios({ prediction, risks, strategy, }) {
    const scenarios = [];
    const pipelineRisk = prediction?.pipelineRiskScore || 0;
    const conversion = prediction?.conversionProbability || 0;
    const readiness = strategy?.summary?.strategicReadiness || 0;
    scenarios.push({
        id: "baseline_growth",
        title: "Controlled Revenue Expansion",
        category: "growth",
        probability: conversion >= 60 ? 78 : 52,
        impact: "positive",
        timeline: "30-60 days",
        forecast: "Operational execution stabilizes while outbound conversion improves gradually.",
        recommendation: "Continue strategic optimization and reduce infrastructure blockers.",
        projectedOutcome: {
            revenueChange: 24,
            riskChange: -12,
            readinessChange: 18,
        },
    });
    if (pipelineRisk >= 70) {
        scenarios.push({
            id: "execution_instability",
            title: "Autonomous Runtime Instability",
            category: "risk",
            probability: 72,
            impact: "negative",
            timeline: "7-30 days",
            forecast: "Unresolved infrastructure and governance weaknesses may reduce execution quality.",
            recommendation: "Prioritize infrastructure resilience and governance stabilization.",
            projectedOutcome: {
                revenueChange: -18,
                riskChange: 22,
                readinessChange: -20,
            },
        });
    }
    if (readiness >= 70) {
        scenarios.push({
            id: "enterprise_scale",
            title: "Enterprise Scale Activation",
            category: "scaling",
            probability: 68,
            impact: "positive",
            timeline: "60-120 days",
            forecast: "Platform transitions into stable enterprise-scale operational execution.",
            recommendation: "Expand automation coverage and onboard operational teams.",
            projectedOutcome: {
                revenueChange: 42,
                riskChange: -8,
                readinessChange: 25,
            },
        });
    }
    scenarios.push({
        id: "governance_optimization",
        title: "Governance Optimization Path",
        category: "governance",
        probability: 81,
        impact: "positive",
        timeline: "14-45 days",
        forecast: "Improved governance workflows reduce operational friction and increase AI execution confidence.",
        recommendation: "Automate governance routing and approval prioritization.",
        projectedOutcome: {
            revenueChange: 16,
            riskChange: -14,
            readinessChange: 12,
        },
    });
    return scenarios;
}
