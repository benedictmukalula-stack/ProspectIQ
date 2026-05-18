"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type ActivityItem = {
  id: string
  type: string
  title: string
  description: string
  source: string
  created_at: string
  severity: "info" | "success" | "warning" | "error"
}

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [filter, setFilter] = useState("all")
  const [message, setMessage] = useState("Loading activity timeline...")

  async function loadActivity() {
    const { data: sessionData } = await supabase.auth.getSession()

    const workspaceResponse = await fetch("/api/workspace/current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: sessionData.session?.user?.id,
        email: sessionData.session?.user?.email,
      }),
    })

    const workspaceData = await workspaceResponse.json()
    const workspaceId = workspaceData.workspace?.id

    if (!workspaceId) {
      setMessage("Workspace not found.")
      return
    }

    const [queueResult, engagementResult, workflowRunsResult] = await Promise.all([
      supabase
        .from("outbound_send_queue")
        .select("id,status,subject,contact_id,created_at,sent_at,metadata")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("outbound_engagement_events")
        .select("id,event_type,source,metadata,created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("ai_workflow_runs")
        .select("id,status,result,created_at,workflow_id")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(20),
    ])

    const queueItems: ActivityItem[] = (queueResult.data || []).map((item: any) => ({
      id: `queue-${item.id}`,
      type: "queue",
      title: item.status === "sent" ? "Outbound email sent" : "Outbound email queued",
      description: item.subject || "Sequence message activity",
      source: "Send Queue",
      created_at: item.sent_at || item.created_at,
      severity: item.status === "sent" ? "success" : "info",
    }))

    const engagementItems: ActivityItem[] = (engagementResult.data || []).map((event: any) => ({
      id: `engagement-${event.id}`,
      type: "engagement",
      title: `Engagement event: ${event.event_type}`,
      description: event.metadata?.source ? `Source: ${event.metadata.source}` : "Prospect engagement recorded",
      source: "Engagement",
      created_at: event.created_at,
      severity: event.event_type === "replied" ? "success" : "info",
    }))

    const workflowItems: ActivityItem[] = (workflowRunsResult.data || []).map((run: any) => ({
      id: `workflow-${run.id}`,
      type: "workflow",
      title: `AI workflow ${run.status}`,
      description: run.result?.content?.slice?.(0, 120) || "AI workflow execution recorded",
      source: "AI Workflows",
      created_at: run.created_at,
      severity: run.status === "completed" ? "success" : run.status === "failed" ? "error" : "warning",
    }))

    const combined = [...queueItems, ...engagementItems, ...workflowItems].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    setItems(combined)
    setMessage("")
  }

  useEffect(() => {
    loadActivity()
  }, [])

  const filteredItems = useMemo(() => {
    if (filter === "all") return items
    return items.filter((item) => item.type === filter)
  }, [items, filter])

  const counts = {
    all: items.length,
    queue: items.filter((item) => item.type === "queue").length,
    engagement: items.filter((item) => item.type === "engagement").length,
    workflow: items.filter((item) => item.type === "workflow").length,
  }

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Activity Timeline</h1>
          <p className="text-sm text-muted-foreground">
            Unified operational feed for outbound delivery, engagement events, and AI workflow execution.
          </p>
        </div>

        <button onClick={loadActivity} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
          Refresh Timeline
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["All Activity", counts.all, "all"],
          ["Queue Events", counts.queue, "queue"],
          ["Engagement", counts.engagement, "engagement"],
          ["AI Workflows", counts.workflow, "workflow"],
        ].map(([label, value, key]) => (
          <button
            key={key}
            onClick={() => setFilter(String(key))}
            className={`rounded-xl border p-5 text-left ${filter === key ? "bg-muted" : ""}`}
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </button>
        ))}
      </section>

      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

      <section className="rounded-xl border">
        <div className="border-b p-5">
          <h2 className="font-semibold">Operational Event Stream</h2>
        </div>

        <div className="divide-y">
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <div key={item.id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs">{item.source}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <span className="h-fit rounded-full border px-3 py-1 text-xs capitalize">
                  {item.severity}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-sm text-muted-foreground">
              No activity found for this filter yet.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
