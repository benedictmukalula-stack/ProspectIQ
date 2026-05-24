const PLAN_LIMITS = {
    free: {
        monthlyAiCredits: 100,
        maxLeads: 100,
        maxSends: 250,
        autonomousExecution: false,
        executiveBoardroom: false,
    },
    pro: {
        monthlyAiCredits: 1000,
        maxLeads: 2500,
        maxSends: 5000,
        autonomousExecution: false,
        executiveBoardroom: false,
    },
    business: {
        monthlyAiCredits: 5000,
        maxLeads: 10000,
        maxSends: 25000,
        autonomousExecution: true,
        executiveBoardroom: true,
    },
    enterprise: {
        monthlyAiCredits: 25000,
        maxLeads: 100000,
        maxSends: 250000,
        autonomousExecution: true,
        executiveBoardroom: true,
    },
};
export function meterWorkspaceUsage({ plan, signals, }) {
    const limits = PLAN_LIMITS[plan];
    const aiCreditsUsed = signals.aiActions * 5 +
        signals.autonomousRuns * 20 +
        signals.simulations * 15 +
        signals.sent * 1;
    const creditUsageRate = Math.round((aiCreditsUsed / limits.monthlyAiCredits) * 100);
    const leadUsageRate = Math.round((signals.leads / limits.maxLeads) * 100);
    const sendUsageRate = Math.round((signals.sent / limits.maxSends) * 100);
    const blockedFeatures = [];
    if (!limits.autonomousExecution) {
        blockedFeatures.push("autonomous_execution");
    }
    if (!limits.executiveBoardroom) {
        blockedFeatures.push("executive_boardroom");
    }
    const overLimit = aiCreditsUsed > limits.monthlyAiCredits ||
        signals.leads > limits.maxLeads ||
        signals.sent > limits.maxSends;
    const commercialStatus = overLimit
        ? "over_limit"
        : creditUsageRate >= 80 || leadUsageRate >= 80 || sendUsageRate >= 80
            ? "near_limit"
            : "healthy";
    const upgradeRecommendation = plan === "free"
        ? "Upgrade to Pro for higher lead and send limits."
        : plan === "pro"
            ? "Upgrade to Business to unlock autonomous execution and executive boardroom intelligence."
            : plan === "business"
                ? "Upgrade to Enterprise for higher AI credit and workspace scale."
                : "Enterprise plan active. Monitor usage and consider custom limits.";
    return {
        plan,
        commercialStatus,
        limits,
        usage: {
            aiCreditsUsed,
            creditUsageRate,
            leads: signals.leads,
            leadUsageRate,
            sent: signals.sent,
            sendUsageRate,
            aiActions: signals.aiActions,
            autonomousRuns: signals.autonomousRuns,
            simulations: signals.simulations,
        },
        entitlements: {
            autonomousExecution: limits.autonomousExecution,
            executiveBoardroom: limits.executiveBoardroom,
            blockedFeatures,
        },
        upgradeRecommendation,
    };
}
