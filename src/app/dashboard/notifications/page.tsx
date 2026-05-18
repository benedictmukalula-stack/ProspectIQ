"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type NotificationItem = {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  read: boolean
  actionHref: string
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filter, setFilter] = useState("unread")
  const [message, setMessage] = useState("Loading notifications...")

  async function loadNotifications() {
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
        .select("id,status,subject,error,created_at,sent_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("outbound_engagement_events")
        .select("id,event_type,created_at,metadata")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("ai_workflow_runs")
        .select("id,status,result,created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(10),
    ])

    const queueNotifications: NotificationItem[] = (queueResult.data || []).map((item: any) => ({
      id: `queue-${item.id}`,
      title: item.error ? "Outbound delivery error" : item.status === "sent" ? "Email sent successfully" : "Email waiting in queue",
      description: item.error || item.subject || "Outbound queue activity detected.",
      category: "Outbound",
      priority: item.error ? "high" : item.status === "queued" ? "medium" : "low",
      read: item.status === "sent",
      actionHref: "/dashboard/send-queue",
      created_at: item.sent_at || item.created_at,
    }))

    const engagementNotifications: NotificationItem[] = (engagementResult.data || []).map((event: any) => ({
      id: `engagement-${event.id}`,
      title: event.event_type === "replied" ? "Prospect replied" : `Prospect ${event.event_type}`,
      description: "Engagement signal captured from outbound activity.",
      category: "Engagement",
      priority: event.event_type === "replied" ? "high" : "medium",
      read: false,
      actionHref: "/dashboard/engagement",
      created_at: event.created_at,
    }))

    const workflowNotifications: NotificationItem[] = (workflowRunsResult.data || []).map((run: any) => ({
      id: `workflow-${run.id}`,
      title: run.status === "completed" ? "AI workflow completed" : "AI workflow needs attention",
      description: run.result?.content?.slice?.(0, 100) || "AI automation event recorded.",
      category: "AI Workflow",
      priority: run.status === "failed" ? "high" : "low",
      read: run.status === "completed",
      actionHref: "/dashboard/ai-workflows",
      created_at: run.created_at,
    }))

    const systemNotifications: NotificationItem[] = [
      {
        id: "system-email-provider",
        title: "Email provider running in mock mode",
        description: "Connect Resend or Amazon SES before production sending.",
        category: "System",
        priority: "high",
        read: false,
        actionHref: "/dashboard/integrations",
        created_at: new Date().toISOString(),
      },
      {
        id: "system-rls",
        title: "Review Supabase RLS policies",
        description: "Enable workspace isolation before public production launch.",
        category: "Security",
        priority: "high",
        read: false,
        actionHref: "/dashboard/security",
        created_at: new Date().toISOString(),
      },
    ]

    const combined = [
      ...systemNotifications,
      ...queueNotifications,
      ...engagementNotifications,
      ...workflowNotifications,
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setNotifications(combined)
    setMessage("")
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const visibleNotifications = useMemo(() => {
    if (filter === "all") return notifications
    if (filter === "unread") return notifications.filter((item) => !item.read)
    return notifications.filter((item) => item.priority === filter)
  }, [notifications, filter])

  const unreadCount = notifications.filter((item) => !item.read).length
  const highCount = notifications.filter((item) => item.priority === "high").length

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Action center for system readiness, engagement signals, outbound activity, and AI workflow alerts.
          </p>
        </div>

        <button onClick={loadNotifications} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
          Refresh Notifications
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Unread</p>
          <p className="mt-2 text-3xl font-semibold">{unreadCount}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">High Priority</p>
          <p className="mt-2 text-3xl font-semibold">{highCount}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total Alerts</p>
          <p className="mt-2 text-3xl font-semibold">{notifications.length}</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {["unread", "all", "high", "medium", "low"].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-lg border px-4 py-2 text-sm capitalize hover:bg-muted ${filter === key ? "bg-muted" : ""}`}
          >
            {key}
          </button>
        ))}
      </div>

      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

      <section className="rounded-xl border divide-y">
        {visibleNotifications.length ? (
          visibleNotifications.map((item) => (
            <div key={item.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">{item.category}</span>
                  <span className="rounded-full border px-2 py-0.5 text-xs capitalize">{item.priority}</span>
                  {!item.read && <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">Unread</span>}
                </div>
                <h2 className="mt-2 font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
              </div>

              <a href={item.actionHref} className="h-fit rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                Open
              </a>
            </div>
          ))
        ) : (
          <div className="p-8 text-sm text-muted-foreground">
            No notifications found for this filter.
          </div>
        )}
      </section>
    </main>
  )
}
