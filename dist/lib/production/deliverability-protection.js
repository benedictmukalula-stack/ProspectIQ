export function evaluateProtectionActions(health) {
    // 🚨 guard: no data yet → no protection
    if (!health || health.deliveryRate === 0) {
        return {
            mode: "normal",
            maxSendRate: 100,
            suppressSending: false,
            actions: [],
            riskLevel: "none",
        };
    }
    if (health.bounceRate > 5) {
        return {
            mode: "protective",
            maxSendRate: 20,
            suppressSending: false,
            actions: [
                "Throttle outbound to 20%",
                "Validate email list quality",
                "Suppress bounced contacts immediately"
            ],
            riskLevel: "high",
        };
    }
    if (health.deliveryRate < 80) {
        return {
            mode: "protective",
            maxSendRate: 50,
            suppressSending: false,
            actions: ["Reduce send rate", "Monitor delivery closely"],
            riskLevel: "medium",
        };
    }
    return {
        mode: "normal",
        maxSendRate: 100,
        suppressSending: false,
        actions: [],
        riskLevel: "low",
    };
}
