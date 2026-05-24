export const PLAN_LIMITS = {
    free: {
        ai_prompts: 25,
        lead_enrichments: 10,
        exports: 0,
        campaigns: 1,
        team_members: 1,
    },
    pro: {
        ai_prompts: 1000,
        lead_enrichments: 500,
        exports: 100,
        campaigns: 25,
        team_members: 3,
    },
    business: {
        ai_prompts: 10000,
        lead_enrichments: 5000,
        exports: 1000,
        campaigns: 250,
        team_members: 15,
    },
    unknown: {
        ai_prompts: 0,
        lead_enrichments: 0,
        exports: 0,
        campaigns: 0,
        team_members: 0,
    },
};
export function getPlanLimits(plan) {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}
export function canUseFeature({ plan, eventType, used, }) {
    const limits = getPlanLimits(plan);
    return used < limits[eventType];
}
