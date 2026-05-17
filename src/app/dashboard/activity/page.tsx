"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ActivityPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])

  async function loadTimeline(workspaceId: string) {
    const response = await fetch("/api/activity/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    })

    const data = await response.json()
    setActivities(data.activities || [])
  }

  async function processAutomations() {
    if (!workspace?.id) return

    await fetch("/api/automation/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id }),
    })

    await loadTimeline(workspace.id)
  }

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const workspaceResponse = await fetch("/api/workspace/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          email: session?.user?.email,
        }),
      })

      const workspaceData = await workspaceResponse.json()
      setWorkspace(workspaceData.workspace)

      if (workspaceData.workspace?.id) {
        await loadTimeline(workspaceData.workspace.id)
      }
    }

    load()
  }, [])

  return (
    <main className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Activity Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Unified view of automation events, AI workflow runs, CRM activity, and outbound actions.
          </p>
        </div>

        <button
          onClick={processAutomations}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Process Automations
        </button>
      </div>

      <section className="space-y-3">
        {activities.length === 0 && (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No activity yet.
          </div>
        )}

        {activities.map((activity) => (
          <div key={activity.id} className="rounded-xl border p-5">
            <p className="font-medium">{activity.title}</p>
            <p className="text-sm text-muted-foreground">
              {activity.description || "No description"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {activity.activity_type} · {new Date(activity.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </section>
    </main>
  )
}
