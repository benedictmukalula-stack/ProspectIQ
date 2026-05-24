import { createClient } from "@supabase/supabase-js";
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
export async function createActivityEvent({ workspaceId, type, severity = "info", title, description, metadata, }) {
    const { error } = await supabaseAdmin
        .from("activity_events")
        .insert({
        workspace_id: workspaceId,
        type,
        severity,
        title,
        description,
        metadata: metadata || {},
    });
    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }
    return {
        success: true,
    };
}
