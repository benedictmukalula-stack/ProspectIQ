import { createActivityEvent } from "../lib/activity/events";
import { simulateEngagement } from "../lib/engagement/simulate";
import { sendProductionEmail } from "../lib/production/email-runtime";
import { evaluateProtectionActions } from "../lib/production/deliverability-protection";
import { computeDeliveryHealth } from "../lib/production/delivery-observability";
import { evaluateThrottle } from "../lib/production/throttling-engine";
export async function processOutboundQueue(items) {
    const results = [];
    const liveSendEnabled = process.env.ENABLE_PRODUCTION_EMAIL_SEND === "true";
    const stats = {
        sent: 10,
        delivered: 9,
        opened: 5,
        clicked: 2,
        bounced: 1,
    };
    const health = computeDeliveryHealth(stats);
    const protection = evaluateProtectionActions(health);
    const throttle = evaluateThrottle({
        sentLastHour: stats.sent,
        sentToday: stats.sent,
        bounceRate: health.bounceRate,
    });
    for (const item of items) {
        // 🚫 HARD BLOCK
        if (!throttle.allowed) {
            await createActivityEvent({
                workspaceId: item.workspaceId,
                type: "throttled_block",
                severity: "warning",
                title: "Sending blocked by throttle",
                description: throttle.reason,
            });
            continue;
        }
        // ⏱ DELAY if needed
        if (throttle.delayMs > 0) {
            await new Promise((r) => setTimeout(r, throttle.delayMs));
        }
        await createActivityEvent({
            workspaceId: item.workspaceId,
            type: "queue_processing",
            severity: "info",
            title: "Processing outbound email",
            description: `Sending email to ${item.recipient}`,
            metadata: {
                throttle,
                protection,
            },
        });
        const delivery = await sendProductionEmail({
            recipient_email: item.recipient,
            subject: item.subject,
            body: item.body,
            allowProductionSend: liveSendEnabled,
            protection,
        });
        if (delivery.success) {
            await createActivityEvent({
                workspaceId: item.workspaceId,
                type: delivery.mode === "production"
                    ? "email_sent"
                    : "email_sent_simulated",
                severity: "success",
                title: delivery.mode === "production"
                    ? "Outbound email sent"
                    : "Outbound email simulated",
                description: `Email processed to ${item.recipient}`,
                metadata: delivery,
            });
            if (delivery.messageId) {
                await simulateEngagement({
                    workspaceId: item.workspaceId,
                    outboundMessageId: delivery.messageId,
                });
            }
        }
        results.push(delivery);
    }
    return results;
}
