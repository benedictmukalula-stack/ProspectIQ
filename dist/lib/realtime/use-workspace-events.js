"use client";
import { useEffect } from "react";
import { subscribeToWorkspaceTable } from "./workspace-channel";
export function useWorkspaceEventsRealtime({ supabase, workspaceId, onEvent, }) {
    useEffect(() => {
        if (!workspaceId)
            return;
        return subscribeToWorkspaceTable({
            supabase,
            workspaceId,
            table: "workspace_events",
            event: "*",
            onChange: onEvent,
        });
    }, [supabase, workspaceId, onEvent]);
}
