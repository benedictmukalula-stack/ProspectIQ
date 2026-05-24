export function evaluateThrottle(input) {
    // 🚫 Hard stop on dangerous bounce rate
    if (input.bounceRate > 8) {
        return {
            allowed: false,
            delayMs: 0,
            reason: "High bounce rate — sending paused",
        };
    }
    // ⚠️ Slow down if volume is high
    if (input.sentLastHour > 50) {
        return {
            allowed: true,
            delayMs: 5000,
            reason: "High hourly volume — throttling",
        };
    }
    if (input.sentToday > 500) {
        return {
            allowed: true,
            delayMs: 2000,
            reason: "High daily volume — mild throttling",
        };
    }
    return {
        allowed: true,
        delayMs: 0,
    };
}
