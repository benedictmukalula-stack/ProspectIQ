export function computeDeliveryHealth(stats) {
    const deliveryRate = stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0;
    const openRate = stats.delivered > 0
        ? Math.round((stats.opened / stats.delivered) * 100)
        : 0;
    const clickRate = stats.opened > 0
        ? Math.round((stats.clicked / stats.opened) * 100)
        : 0;
    const bounceRate = stats.sent > 0 ? Math.round((stats.bounced / stats.sent) * 100) : 0;
    let health = "healthy";
    if (bounceRate > 5)
        health = "warning";
    if (bounceRate > 10)
        health = "critical";
    return {
        deliveryRate,
        openRate,
        clickRate,
        bounceRate,
        health,
    };
}
