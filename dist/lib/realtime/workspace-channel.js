export function subscribeToWorkspaceTable({ supabase, workspaceId, table, event = "*", onChange, }) {
    const channel = supabase
        .channel(`workspace:${workspaceId}:${table}`)
        .on("postgres_changes", {
        event,
        schema: "public",
        table,
        filter: `workspace_id=eq.${workspaceId}`,
    }, onChange)
        .subscribe();
    return () => {
        supabase.removeChannel(channel);
    };
}
