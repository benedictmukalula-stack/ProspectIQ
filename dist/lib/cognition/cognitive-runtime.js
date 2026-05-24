export function calculateStrategicReadiness(initiatives) {
    if (!initiatives.length)
        return 85;
    const penalty = initiatives.reduce((sum, item) => {
        if (item.priority === "high")
            return sum + 18;
        if (item.priority === "medium")
            return sum + 9;
        return sum + 4;
    }, 0);
    return Math.max(0, Math.min(100, 100 - penalty));
}
export function buildStrategicPlanSummary(initiatives) {
    return {
        totalInitiatives: initiatives.length,
        highPriority: initiatives.filter((item) => item.priority === "high").length,
        mediumPriority: initiatives.filter((item) => item.priority === "medium").length,
        shortTerm: initiatives.filter((item) => item.horizon === "short_term").length,
        midTerm: initiatives.filter((item) => item.horizon === "mid_term").length,
        longTerm: initiatives.filter((item) => item.horizon === "long_term").length,
        strategicReadiness: calculateStrategicReadiness(initiatives),
    };
}
