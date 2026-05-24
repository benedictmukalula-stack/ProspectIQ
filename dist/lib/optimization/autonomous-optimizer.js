function priorityWeight(confidence) {
    if (confidence === "high")
        return 3;
    if (confidence === "medium")
        return 2;
    return 1;
}
function mostWeighted(rules, key, fallback) {
    const scores = new Map();
    for (const rule of rules) {
        const value = rule.generationImpact[key];
        if (!value)
            continue;
        scores.set(value, (scores.get(value) || 0) + priorityWeight(rule.confidence));
    }
    if (scores.size === 0)
        return fallback;
    return Array.from(scores.entries()).sort((a, b) => b[1] - a[1])[0][0];
}
function buildActions(plan) {
    const actions = [];
    if (plan.cadence === "accelerate") {
        actions.push({
            type: "cadence",
            priority: "high",
            title: "Accelerate high-intent follow-up",
            description: "Reduce delay windows for hot or engaged leads.",
        });
    }
    if (plan.deliveryRiskMode === "protective") {
        actions.push({
            type: "delivery_risk",
            priority: "critical",
            title: "Protect sender reputation",
            description: "Extend cadence and review provider/delivery quality before scaling.",
        });
    }
    if (plan.ctaStrength === "strong") {
        actions.push({
            type: "copy",
            priority: "medium",
            title: "Use stronger call-to-action",
            description: "Generate copy with clearer meeting or demo prompts.",
        });
    }
    actions.push({
        type: "strategy",
        priority: "medium",
        title: "Apply vertical optimization",
        description: plan.verticalStrategy,
    });
    return actions;
}
export function generateAutonomousOptimizationPlan({ rules, dominantIndustry, failureRate, }) {
    const cadence = mostWeighted(rules, "cadence", "standard");
    const tone = mostWeighted(rules, "tone", "consultative");
    const ctaStrength = mostWeighted(rules, "ctaStrength", "medium");
    const sequenceLength = mostWeighted(rules, "sequenceLength", "standard");
    const deliveryRiskMode = (failureRate || 0) > 10 ? "protective" : "normal";
    const verticalStrategy = dominantIndustry && dominantIndustry !== "general market"
        ? `Prioritize ${dominantIndustry}-specific pain points, outcomes, and language.`
        : "Use general B2B revenue operations language.";
    const rationale = rules.map((rule) => {
        return `${rule.rule}: ${rule.recommendation}`;
    });
    const base = {
        cadence,
        tone,
        ctaStrength,
        sequenceLength,
        deliveryRiskMode,
        verticalStrategy,
        rationale,
    };
    return {
        ...base,
        actions: buildActions(base),
    };
}
export function generateAutonomousOptimizations(input = {}) {
    if ("rules" in input && Array.isArray(input.rules)) {
        return generateAutonomousOptimizationPlan({
            rules: input.rules,
            dominantIndustry: input.dominantIndustry,
            failureRate: input.failureRate,
        });
    }
    const base = {
        cadence: "standard",
        tone: "consultative",
        ctaStrength: "medium",
        sequenceLength: "standard",
        deliveryRiskMode: "normal",
        verticalStrategy: "Use general B2B revenue operations language.",
        rationale: [
            "Compatibility mode used for legacy runtime execution route.",
            "Runtime intelligence payload detected.",
            "Runtime prediction payload detected.",
        ],
    };
    return {
        ...base,
        actions: buildActions(base),
    };
}
