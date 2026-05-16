export type Plan = "free" | "pro" | "business"

export type FeatureKey =
  | "ai_assistant"
  | "lead_enrichment"
  | "exports"
  | "campaigns"
  | "team_management"
  | "advanced_analytics"

export const FEATURE_ACCESS: Record<Plan, Record<FeatureKey, boolean>> = {
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
}

export function canAccessFeature(plan: string | null | undefined, feature: FeatureKey) {
  const safePlan = (plan || "free") as Plan
  return FEATURE_ACCESS[safePlan]?.[feature] ?? false
}
