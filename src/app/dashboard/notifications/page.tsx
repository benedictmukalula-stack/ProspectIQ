"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useWorkspaceNotificationsRealtime } from "@/lib/realtime/use-workspace-notifications"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NotificationsPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [filter, setFilter] = useState("unread")
  const [message, setMessage] = useState("Loading notifications...")

  async function loadNotifications() {
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
    const currentWorkspace = workspaceData.workspace
    setWorkspace(currentWorkspace)

    if (!currentWorkspace?.id) {
      setMessage("Workspace not found.")
      return
    }

    const response = await fetch(
      `/api/workspace/notifications?workspaceId=${currentWorkspace.id}`
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || "Failed to load notifications.")
      return
    }

    setNotifications(data.notifications || [])
    setMessage("")
  }

  async function markRead(notificationId: string) {
    const response = await fetch("/api/workspace/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationId,
        read: true,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || "Failed to update notification.")
      return
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true, read_at: new Date().toISOString() } : item
      )
    )
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useWorkspaceNotificationsRealtime({
    supabase,
    workspaceId: workspace?.id,
    onNotification: (payload) => {
      if (payload.eventType === "INSERT" && payload.new) {
        setNotifications((current) => [payload.new, ...current])
      }

      if (payload.eventType === "UPDATE" && payload.new) {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === payload.new.id ? payload.new : notification
          )
        )
      }

      if (payload.eventType === "DELETE" && payload.old) {
        setNotifications((current) =>
          current.filter((notification) => notification.id !== payload.old.id)
        )
      }
    },
  })

  const visibleNotifications = useMemo(() => {
    if (filter === "all") return notifications
    if (filter === "unread") return notifications.filter((item) => !item.read)
    return notifications.filter((item) => item.priority === filter)
  }, [notifications, filter])

  const unreadCount = notifications.filter((item) => !item.read).length
  const highCount = notifications.filter((item) => item.priority === "high").length
  const mediumCount = notifications.filter((item) => item.priority === "medium").length

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">Workspace Alert Center</p>
        <h1 className="mt-2 text-3xl font-bold">Live Notifications</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Centralized notification center for workspace alerts, security readiness, system events, and operational actions.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Unread", unreadCount, "unread"],
            ["High Priority", highCount, "high"],
            ["Medium", mediumCount, "medium"],
            ["All Alerts", notifications.length, "all"],
          ].map(([label, value, key]) => (
            <button
              key={String(key)}
              onClick={() => setFilter(String(key))}
              className={`rounded-xl border border-white/10 bg-white/5 p-4 text-left ${filter === key ? "ring-2 ring-white/40" : ""}`}
            >
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Workspace: {workspace?.name || "Loading..."}
        </p>

        <button onClick={loadNotifications} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
          Refresh Notifications
        </button>
      </div>

      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

      <section className="rounded-2xl border divide-y">
        {visibleNotifications.length ? (
          visibleNotifications.map((item) => (
            <article key={item.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {item.category}
                  </span>
                  <span className="rounded-full border px-2 py-0.5 text-xs capitalize">
                    {item.priority}
                  </span>
                  {!item.read && (
                    <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                      Unread
                    </span>
                  )}
                </div>

                <h2 className="mt-3 font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap items-start gap-2 md:justify-end">
                {item.action_href && (
                  <a href={item.action_href} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                    Open
                  </a>
                )}

                {!item.read && (
                  <button
                    onClick={() => markRead(item.id)}
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </article>
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
