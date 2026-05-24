export function generateSequenceLearningRules(memory) {
    const summary = memory.summary || {};
    const topIndustry = memory.recipientpIndustries?.[0]?.industry || "general market";
    const rules = [];
    if ((summary.replyRate || 0) > 0) {
        rules.push({
            rule: "Reply-aware automation control",
            confidence: "high",
            appliesTo: "contacts with reply events",
            recommendation: "Stop automated sequences once replies are detected and hand off to manual sales follow-up.",
            generationImpact: {
                cadence: "accelerate",
                tone: "direct",
                ctaStrength: "strong",
                sequenceLength: "short",
            },
        });
    }
    if ((summary.engagementRate || 0) >= 50) {
        rules.push({
            rule: "High engagement workspace",
            confidence: "high",
            appliesTo: "warm and hot leads",
            recommendation: "Use shorter, more decisive sequences because the workspace is already producing strong engagement.",
            generationImpact: {
                cadence: "accelerate",
                tone: "consultative",
                ctaStrength: "strong",
                sequenceLength: "short",
            },
        });
    }
    if ((summary.failureRate || 0) > 10) {
        rules.push({
            rule: "Delivery risk protection",
            confidence: "high",
            appliesTo: "all outbound generation",
            recommendation: "Reduce sending pressure and prioritize email quality checks before generating aggressive outreach.",
            generationImpact: {
                cadence: "extend",
                tone: "light-touch",
                ctaStrength: "soft",
                sequenceLength: "short",
            },
        });
    }
    if ((summary.warm || 0) > (summary.cold || 0)) {
        rules.push({
            rule: "Warm audience expansion",
            confidence: "medium",
            appliesTo: "warm lifecycle contacts",
            recommendation: "Generate value-led nurture sequences designed to convert warm contacts into hot opportunities.",
            generationImpact: {
                cadence: "standard",
                tone: "educational",
                ctaStrength: "medium",
                sequenceLength: "standard",
            },
        });
    }
    if ((summary.hot || 0) > 0) {
        rules.push({
            rule: "Hot lead acceleration",
            confidence: "high",
            appliesTo: "hot leads",
            recommendation: "Generate high-intent follow-ups with clear meeting CTAs and shorter delay windows.",
            generationImpact: {
                cadence: "accelerate",
                tone: "direct",
                ctaStrength: "strong",
                sequenceLength: "short",
            },
        });
    }
    if (topIndustry && topIndustry !== "general market") {
        rules.push({
            rule: "Vertical-specific sequence adaptation",
            confidence: "medium",
            appliesTo: topIndustry,
            recommendation: `Adapt future AI-generated sequences to reference ${topIndustry} workflows, pain points, and operational outcomes.`,
            generationImpact: {
                cadence: "standard",
                tone: "consultative",
                ctaStrength: "medium",
                sequenceLength: "standard",
            },
        });
    }
    if (rules.length === 0) {
        rules.push({
            rule: "Default learning baseline",
            confidence: "low",
            appliesTo: "general outbound",
            recommendation: "Insufficient historical signal. Continue using standard three-step educational outreach.",
            generationImpact: {
                cadence: "standard",
                tone: "educational",
                ctaStrength: "soft",
                sequenceLength: "standard",
            },
        });
    }
    return {
        summary: {
            rulesGenerated: rules.length,
            dominantIndustry: topIndustry,
            engagementRate: summary.engagementRate || 0,
            replyRate: summary.replyRate || 0,
            failureRate: summary.failureRate || 0,
        },
        rules,
    };
}
