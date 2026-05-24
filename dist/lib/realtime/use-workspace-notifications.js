"use client";
import { useEffect } from "react";
import { subscribeToWorkspaceTable } from "./workspace-channel";
export function useWorkspaceNotificationsRealtime({ supabase, workspaceId, onNotification, }) {
    useEffect(() => {
        if (!workspaceId)
            return;
        return subscribeToWorkspaceTable({
            supabase,
            workspaceId,
            table: "workspace_notifications",
            event: "*",
            onChange: onNotification,
        });
    }, [supabase, workspaceId, onNotification]);
}
