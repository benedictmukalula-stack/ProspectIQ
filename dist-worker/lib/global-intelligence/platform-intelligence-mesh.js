function percent(part, total) {
    if (total === 0)
        return 0;
    return Math.round((part / total) * 100);
}
export function generatePlatformIntelligenceMesh({ leads, companies, engagementEvents, queue, }) {
    const workspaceIds = Array.from(new Set([
        ...leads.map((item) => item.workspace_id).filter(Boolean),
        ...companies.map((item) => item.workspace_id).filter(Boolean),
        ...engagementEvents.map((item) => item.workspace_id).filter(Boolean),
        ...queue.map((item) => item.workspace_id).filter(Boolean),
    ]));
    const industryCounts = new Map();
    for (const company of companies) {
        const industry = company.industry || "Unknown";
        industryCounts.set(industry, (industryCounts.get(industry) || 0) + 1);
    }
    const industryBenchmarks = Array.from(industryCounts.entries())
        .map(([industry, companyCount]) => {
        const industryCompanies = companies.filter((company) => (company.industry || "Unknown") === industry);
        const workspaceSet = new Set(industryCompanies.map((company) => company.workspace_id).filter(Boolean));
        const relatedLeads = leads.filter((lead) => lead.workspace_id ? workspaceSet.has(lead.workspace_id) : false);
        const hot = relatedLeads.filter((lead) => lead.hot_lead || lead.lifecycle_stage === "hot").length;
        const warm = relatedLeads.filter((lead) => lead.lifecycle_stage === "warm").length;
        const avgScore = relatedLeads.length > 0
            ? Math.round(relatedLeads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / relatedLeads.length)
            : 0;
        return {
            industry,
            companyCount,
            workspaces: workspaceSet.size,
            leads: relatedLeads.length,
            hot,
            warm,
            averageScore: avgScore,
            hotRate: percent(hot, relatedLeads.length),
        };
    })
        .sort((a, b) => b.hotRate - a.hotRate || b.averageScore - a.averageScore);
    const sent = queue.filter((item) => item.status === "sent").length;
    const failed = queue.filter((item) => item.status === "failed").length;
    const opened = engagementEvents.filter((event) => event.event_type === "opened").length;
    const clicked = engagementEvents.filter((event) => event.event_type === "clicked").length;
    const replied = engagementEvents.filter((event) => event.event_type === "replied").length;
    const bounced = engagementEvents.filter((event) => event.event_type === "bounced").length;
    const platformPatterns = [];
    if (replied > 0) {
        platformPatterns.push({
            pattern: "Reply signals exist across platform data",
            recommendation: "Maintain reply-aware stopping and manual handoff as a global default.",
            impact: "high",
        });
    }
    if (clicked > 0) {
        platformPatterns.push({
            pattern: "Click intent present",
            recommendation: "Use stronger CTA policies for clicked or high-intent segments.",
            impact: "medium",
        });
    }
    if (failed + bounced > 0) {
        platformPatterns.push({
            pattern: "Delivery risk detected",
            recommendation: "Activate protective throttling for affected workspaces and suppress bounced contacts.",
            impact: "high",
        });
    }
    if (industryBenchmarks[0]) {
        platformPatterns.push({
            pattern: `${industryBenchmarks[0].industry} is the strongest current vertical`,
            recommendation: `Generate more ${industryBenchmarks[0].industry}-specific messaging and benchmarks.`,
            impact: "medium",
        });
    }
    if (platformPatterns.length === 0) {
        platformPatterns.push({
            pattern: "Insufficient global signal",
            recommendation: "Continue collecting workspace activity before applying platform-level optimization.",
            impact: "low",
        });
    }
    return {
        summary: {
            workspaces: workspaceIds.length,
            leads: leads.length,
            companies: companies.length,
            sent,
            failed,
            opened,
            clicked,
            replied,
            bounced,
            engagementRate: percent(opened + clicked + replied, sent),
            replyRate: percent(replied, sent),
            failureRate: percent(failed + bounced, sent + failed),
        },
        industryBenchmarks,
        platformPatterns,
    };
}
