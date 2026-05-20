import type { SequenceLearningRule } from "@/lib/learning/sequence-learning-engine"

type OptimizationAction = {
  type: string
  priority: "critical" | "high" | "medium" | "low"
  title: string
  description: string
}

type OptimizationPlan = {
  cadence: "accelerate" | "standard" | "extend"
  tone: "direct" | "consultative" | "educational" | "light-touch"
  ctaStrength: "strong" | "medium" | "soft"
  sequenceLength: "short" | "standard" | "long"
  deliveryRiskMode: "normal" | "protective"
  verticalStrategy: string
  rationale: string[]
  actions: OptimizationAction[]
}

type LegacyOptimizationInput = {
  intelligence?: unknown
  prediction?: unknown
}

type LearningOptimizationInput = {
  rules?: SequenceLearningRule[]
  dominantIndustry?: string
  failureRate?: number
}

function priorityWeight(confidence: SequenceLearningRule["confidence"]) {
  if (confidence === "high") return 3
  if (confidence === "medium") return 2
  return 1
}

function mostWeighted<T extends string>(
  rules: SequenceLearningRule[],
  key: keyof SequenceLearningRule["generationImpact"],
  fallback: T
): T {
  const scores = new Map<string, number>()

  for (const rule of rules) {
    const value = rule.generationImpact[key]

    if (!value) continue

    scores.set(value, (scores.get(value) || 0) + priorityWeight(rule.confidence))
  }

  if (scores.size === 0) return fallback

  return Array.from(scores.entries()).sort((a, b) => b[1] - a[1])[0][0] as T
}

function buildActions(plan: Omit<OptimizationPlan, "actions">): OptimizationAction[] {
  const actions: OptimizationAction[] = []

  if (plan.cadence === "accelerate") {
    actions.push({
      type: "cadence",
      priority: "high",
      title: "Accelerate high-intent follow-up",
      description: "Reduce delay windows for hot or engaged leads.",
    })
  }

  if (plan.deliveryRiskMode === "protective") {
    actions.push({
      type: "delivery_risk",
      priority: "critical",
      title: "Protect sender reputation",
      description: "Extend cadence and review provider/delivery quality before scaling.",
    })
  }

  if (plan.ctaStrength === "strong") {
    actions.push({
      type: "copy",
      priority: "medium",
      title: "Use stronger call-to-action",
      description: "Generate copy with clearer meeting or demo prompts.",
    })
  }

  actions.push({
    type: "strategy",
    priority: "medium",
    title: "Apply vertical optimization",
    description: plan.verticalStrategy,
  })

  return actions
}

export function generateAutonomousOptimizationPlan({
  rules,
  dominantIndustry,
  failureRate,
}: {
  rules: SequenceLearningRule[]
  dominantIndustry?: string
  failureRate?: number
}): OptimizationPlan {
  const cadence = mostWeighted(rules, "cadence", "standard")
  const tone = mostWeighted(rules, "tone", "consultative")
  const ctaStrength = mostWeighted(rules, "ctaStrength", "medium")
  const sequenceLength = mostWeighted(rules, "sequenceLength", "standard")

  const deliveryRiskMode: "normal" | "protective" = (failureRate || 0) > 10 ? "protective" : "normal"

  const verticalStrategy =
    dominantIndustry && dominantIndustry !== "general market"
      ? `Prioritize ${dominantIndustry}-specific pain points, outcomes, and language.`
      : "Use general B2B revenue operations language."

  const rationale = rules.map((rule) => {
    return `${rule.rule}: ${rule.recommendation}`
  })

  const base = {
    cadence,
    tone,
    ctaStrength,
    sequenceLength,
    deliveryRiskMode,
    verticalStrategy,
    rationale,
  }

  return {
    ...base,
    actions: buildActions(base),
  }
}

export function generateAutonomousOptimizations(
  input: LearningOptimizationInput | LegacyOptimizationInput = {}
): OptimizationPlan {
  if ("rules" in input && Array.isArray(input.rules)) {
    return generateAutonomousOptimizationPlan({
      rules: input.rules,
      dominantIndustry: input.dominantIndustry,
      failureRate: input.failureRate,
    })
  }

  const base = {
    cadence: "standard" as const,
    tone: "consultative" as const,
    ctaStrength: "medium" as const,
    sequenceLength: "standard" as const,
    deliveryRiskMode: "normal" as const,
    verticalStrategy: "Use general B2B revenue operations language.",
    rationale: [
      "Compatibility mode used for legacy runtime execution route.",
      "Runtime intelligence payload detected.",
      "Runtime prediction payload detected.",
    ],
  }

  return {
    ...base,
    actions: buildActions(base),
  }
}
