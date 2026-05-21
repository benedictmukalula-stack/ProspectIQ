type PlatformMesh = {
  summary?: {
    engagementRate?: number
    replyRate?: number
    failureRate?: number
  }
  industryBenchmarks?: Array<{
    industry: string
    hotRate: number
    averageScore: number
  }>
  platformPatterns?: Array<{
    pattern: string
    recommendation: string
    impact: "high" | "medium" | "low"
  }>
}

export type SelfImprovementDirective = {
  directive: string
  priority: "critical" | "high" | "medium" | "low"
  reason: string
  tuning: {
    sequenceLength?: "short" | "standard" | "long"
    tone?: "direct" | "consultative" | "educational" | "light-touch"
    ctaStrength?: "strong" | "medium" | "soft"
    cadence?: "accelerate" | "standard" | "extend"
    deliveryMode?: "normal" | "protective"
    verticalFocus?: string
  }
}

export function generateSelfImprovementDirectives(mesh: PlatformMesh) {
  const summary = mesh.summary || {}
  const topIndustry = mesh.industryBenchmarks?.[0]
  const directives: SelfImprovementDirective[] = []

  if ((summary.failureRate || 0) > 10) {
    directives.push({
      directive: "Activate platform delivery protection",
      priority: "critical",
      reason:
        "Platform failure rate is elevated. Sending should become more conservative until delivery health improves.",
      tuning: {
        cadence: "extend",
        deliveryMode: "protective",
        ctaStrength: "soft",
      },
    })
  }

  if ((summary.replyRate || 0) > 5) {
    directives.push({
      directive: "Strengthen reply-aware sales handoff",
      priority: "high",
      reason:
        "Reply rate is strong enough to justify default reply stopping and manual escalation behavior.",
      tuning: {
        sequenceLength: "short",
        tone: "direct",
        ctaStrength: "strong",
        cadence: "accelerate",
      },
    })
  }

  if ((summary.engagementRate || 0) >= 50) {
    directives.push({
      directive: "Compress high-engagement sequences",
      priority: "high",
      reason:
        "Platform engagement is strong. Shorter, more decisive sequences should be favored.",
      tuning: {
        sequenceLength: "short",
        tone: "consultative",
        ctaStrength: "strong",
        cadence: "accelerate",
      },
    })
  }

  if (topIndustry && topIndustry.hotRate >= 50) {
    directives.push({
      directive: `Increase ${topIndustry.industry} vertical weighting`,
      priority: "medium",
      reason:
        `${topIndustry.industry} is currently outperforming other verticals with ${topIndustry.hotRate}% hot-rate signal.`,
      tuning: {
        verticalFocus: topIndustry.industry,
        tone: "consultative",
        ctaStrength: "medium",
      },
    })
  }

  for (const pattern of mesh.platformPatterns || []) {
    if (pattern.impact === "high") {
      directives.push({
        directive: `Reinforce pattern: ${pattern.pattern}`,
        priority: "high",
        reason: pattern.recommendation,
        tuning: {
          sequenceLength: "short",
          cadence: "accelerate",
        },
      })
    }
  }

  if (directives.length === 0) {
    directives.push({
      directive: "Maintain baseline learning mode",
      priority: "low",
      reason:
        "Insufficient platform-level signal to tune autonomous behavior aggressively.",
      tuning: {
        sequenceLength: "standard",
        tone: "educational",
        ctaStrength: "soft",
        cadence: "standard",
        deliveryMode: "normal",
      },
    })
  }

  return {
    summary: {
      directives: directives.length,
      engagementRate: summary.engagementRate || 0,
      replyRate: summary.replyRate || 0,
      failureRate: summary.failureRate || 0,
      leadingVertical: topIndustry?.industry || "none",
    },
    directives,
  }
}
