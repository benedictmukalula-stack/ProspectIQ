import { adaptSequence } from "../lib/ai/adaptive-sequence-engine";
export async function runAutonomousRevenueAgent({ workspaceId, contactId, supabase, }) {
    try {
        const { data: lead, error: leadError } = await supabase
            .from("crm_contacts")
            .select("id,lead_score,lifecycle_stage,hot_lead,email,first_name,last_name")
            .eq("workspace_id", workspaceId)
            .eq("id", contactId)
            .single();
        if (leadError)
            throw new Error(leadError.message);
        const { data: messages, error: messagesError } = await supabase
            .from("outbound_send_queue")
            .select("id,status,contact_id")
            .eq("workspace_id", workspaceId)
            .eq("contact_id", contactId);
        if (messagesError)
            throw new Error(messagesError.message);
        const messageIds = (messages || []).map((message) => message.id);
        let events = [];
        if (messageIds.length > 0) {
            const { data: engagementEvents, error: eventsError } = await supabase
                .from("engagement_events")
                .select("event_type")
                .eq("workspace_id", workspaceId)
                .in("outbound_message_id", messageIds);
            if (eventsError)
                throw new Error(eventsError.message);
            events = engagementEvents || [];
        }
        const decision = adaptSequence({
            events,
            lead,
        });
        if (decision.decision === "stop_sequence") {
            await supabase
                .from("outbound_enrollments")
                .update({
                status: "paused",
                next_send_at: null,
            })
                .eq("workspace_id", workspaceId)
                .eq("contact_id", contactId);
            await supabase
                .from("outbound_send_queue")
                .update({
                status: "failed",
            })
                .eq("workspace_id", workspaceId)
                .eq("contact_id", contactId)
                .eq("status", "pending");
            return {
                contactId,
                decision: decision.decision,
                priority: decision.priority,
                actionTaken: "Paused active enrollments and cancelled pending queue items.",
                success: true,
            };
        }
        if (decision.decision === "accelerate_followup" ||
            decision.decision === "stronger_cta") {
            await supabase
                .from("outbound_enrollments")
                .update({
                next_send_at: new Date(Date.now() + decision.recommendedDelayDays * 24 * 60 * 60 * 1000).toISOString(),
            })
                .eq("workspace_id", workspaceId)
                .eq("contact_id", contactId)
                .eq("status", "active");
            await supabase
                .from("crm_contacts")
                .update({
                hot_lead: true,
            })
                .eq("workspace_id", workspaceId)
                .eq("id", contactId);
            return {
                contactId,
                decision: decision.decision,
                priority: decision.priority,
                actionTaken: "Accelerated next follow-up and flagged lead as hot.",
                success: true,
            };
        }
        if (decision.decision === "soft_nurture" ||
            decision.decision === "extend_cadence") {
            await supabase
                .from("outbound_enrollments")
                .update({
                next_send_at: new Date(Date.now() + decision.recommendedDelayDays * 24 * 60 * 60 * 1000).toISOString(),
            })
                .eq("workspace_id", workspaceId)
                .eq("contact_id", contactId)
                .eq("status", "active");
            return {
                contactId,
                decision: decision.decision,
                priority: decision.priority,
                actionTaken: decision.decision === "soft_nurture"
                    ? "Adjusted cadence for nurture follow-up."
                    : "Extended cadence to reduce over-messaging.",
                success: true,
            };
        }
        return {
            contactId,
            decision: decision.decision,
            priority: decision.priority,
            actionTaken: "No operational change required.",
            success: true,
        };
    }
    catch (error) {
        return {
            contactId,
            decision: "error",
            priority: "high",
            actionTaken: "Agent failed before completing execution.",
            success: false,
            error: error instanceof Error ? error.message : "Unknown agent error",
        };
    }
}
