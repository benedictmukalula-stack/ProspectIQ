import { SupabaseClient } from "@supabase/supabase-js"

export function subscribeToWorkspaceTable({
  supabase,
  workspaceId,
  table,
  event = "*",
  onChange,
}: {
  supabase: SupabaseClient
  workspaceId: string
  table: string
  event?: "*" | "INSERT" | "UPDATE" | "DELETE"
  onChange: (payload: any) => void
}) {
  const channel = supabase
    .channel(`workspace:${workspaceId}:${table}`)
    .on(
      "postgres_changes",
      {
        event,
        schema: "public",
        table,
        filter: `workspace_id=eq.${workspaceId}`,
      },
      onChange
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
