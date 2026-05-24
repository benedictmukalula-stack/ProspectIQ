export const FEATURE_ACCESS = {
    free: {
        ai_assistant: true,
        lead_enrichment: false,
        exports: false,
        campaigns: true,
        team_management: false,
        advanced_analytics: false,
    },
    pro: {
        ai_assistant: true,
        lead_enrichment: true,
        exports: true,
        campaigns: true,
        team_management: false,
        advanced_analytics: true,
    },
    business: {
        ai_assistant: true,
        lead_enrichment: true,
        exports: true,
        campaigns: true,
        team_management: true,
        advanced_analytics: true,
    },
};
export function canAccessFeature(plan, feature) {
    const safePlan = (plan || "free");
    return FEATURE_ACCESS[safePlan]?.[feature] ?? false;
}
