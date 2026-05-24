export async function trackUsage({ userId, eventType, quantity = 1, metadata = {}, }) {
    const response = await fetch("/api/usage/track", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId,
            eventType,
            quantity,
            metadata,
        }),
    });
    const data = await response.json();
    return {
        ok: response.ok,
        status: response.status,
        data,
    };
}
