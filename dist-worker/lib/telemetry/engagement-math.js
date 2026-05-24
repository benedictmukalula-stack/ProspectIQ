import { QUEUE_STATUS } from "../lib/queue/status";
export function safePercent(numerator, denominator) {
    if (!denominator || denominator <= 0)
        return 0;
    return Math.min(100, Math.max(0, Math.round((numerator / denominator) * 100)));
}
export function uniqueCountBy(items, keyFn) {
    const keys = new Set();
    for (const item of items) {
        const key = keyFn(item);
        if (key)
            keys.add(key);
    }
    return keys.size;
}
export function normalizeEngagementMetrics({ queue, engagement, }) {
    const sent = queue.filter((item) => item.status === QUEUE_STATUS.SENT);
    const sentCount = sent.length;
    const openedEvents = engagement.filter((event) => event.event_type === "opened");
    const clickedEvents = engagement.filter((event) => event.event_type === "clicked");
    const repliedEvents = engagement.filter((event) => event.event_type === "replied");
    const uniqueOpened = uniqueCountBy(openedEvents, (event) => event.contact_id || event.queue_id || event.id);
    const uniqueClicked = uniqueCountBy(clickedEvents, (event) => event.contact_id || event.queue_id || event.id);
    const uniqueReplied = uniqueCountBy(repliedEvents, (event) => event.contact_id || event.queue_id || event.id);
    return {
        sent: sentCount,
        queued: queue.filter((item) => item.status === "queued").length,
        opened: openedEvents.length,
        clicked: clickedEvents.length,
        replied: repliedEvents.length,
        uniqueOpened,
        uniqueClicked,
        uniqueReplied,
        openRate: safePercent(uniqueOpened, sentCount),
        clickRate: safePercent(uniqueClicked, sentCount),
        replyRate: safePercent(uniqueReplied, sentCount),
    };
}
