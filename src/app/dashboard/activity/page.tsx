"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useWorkspaceEventsRealtime } from "@/lib/realtime/use-workspace-events"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ActivityPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [message, setMessage] = useState("Loading workspace events...")

  async function loadEvents() {
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
      `/api/workspace/events?workspaceId=${currentWorkspace.id}`
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || "Failed to load workspace events.")
      return
    }

    setEvents(data.events || [])
    setMessage("")
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useWorkspaceEventsRealtime({
    supabase,
    workspaceId: workspace?.id,
    onEvent: (payload) => {
      if (payload.eventType === "INSERT" && payload.new) {
        setEvents((current) => [payload.new, ...current])
      }

      if (payload.eventType === "UPDATE" && payload.new) {
        setEvents((current) =>
          current.map((event) =>
            event.id === payload.new.id ? payload.new : event
          )
        )
      }

      if (payload.eventType === "DELETE" && payload.old) {
        setEvents((current) =>
          current.filter((event) => event.id !== payload.old.id)
        )
      }
    },
  })

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events
    return events.filter((event) => event.severity === filter || event.source === filter)
  }, [events, filter])

  const counts = {
    all: events.length,
    success: events.filter((e) => e.severity === "success").length,
    warning: events.filter((e) => e.severity === "warning").length,
    system: events.filter((e) => e.source === "system").length,
  }

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">Workspace Telemetry</p>
        <h1 className="mt-2 text-3xl font-bold">Live Activity Feed</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Centralized event stream for workspace operations, automation events, security alerts, outbound activity, and system telemetry.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["All Events", counts.all, "all"],
            ["Success", counts.success, "success"],
            ["Warnings", counts.warning, "warning"],
            ["System", counts.system, "system"],
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

        <button onClick={loadEvents} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
          Refresh Events
        </button>
      </div>

      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

      <section className="rounded-2xl border">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Operational Timeline</h2>
        </div>

        <div className="divide-y">
          {filteredEvents.length ? (
            filteredEvents.map((event) => (
              <article key={event.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {event.event_type}
                    </span>
                    <span className="rounded-full border px-2 py-0.5 text-xs capitalize">
                      {event.severity}
                    </span>
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {event.source}
                    </span>
                  </div>

                  <h3 className="mt-3 font-semibold">{event.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.description || "Workspace event recorded."}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right text-xs text-muted-foreground">
                  {event.entity_type || "system"}
                </div>
              </article>
            ))
          ) : (
            <div className="p-8 text-sm text-muted-foreground">
              No workspace events found for this filter.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
