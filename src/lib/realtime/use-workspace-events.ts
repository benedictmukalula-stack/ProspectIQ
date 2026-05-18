"use client"

import { useEffect } from "react"
import { SupabaseClient } from "@supabase/supabase-js"
import { subscribeToWorkspaceTable } from "./workspace-channel"

export function useWorkspaceEventsRealtime({
  supabase,
  workspaceId,
  onEvent,
}: {
  supabase: SupabaseClient
  workspaceId?: string
  onEvent: (payload: any) => void
}) {
  useEffect(() => {
    if (!workspaceId) return

    return subscribeToWorkspaceTable({
      supabase,
      workspaceId,
      table: "workspace_events",
      event: "*",
      onChange: onEvent,
    })
  }, [supabase, workspaceId, onEvent])
}
