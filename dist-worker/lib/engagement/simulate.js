import { trackEvent } from "./events";
export async function simulateEngagement({ workspaceId, outboundMessageId, }) {
    await trackEvent({
        workspaceId,
        outboundMessageId,
        type: "delivered",
    });
    const opened = Math.random() > 0.3;
    if (opened) {
        await trackEvent({
            workspaceId,
            outboundMessageId,
            type: "opened",
        });
    }
    const clicked = Math.random() > 0.6;
    if (clicked) {
        await trackEvent({
            workspaceId,
            outboundMessageId,
            type: "clicked",
        });
    }
}
