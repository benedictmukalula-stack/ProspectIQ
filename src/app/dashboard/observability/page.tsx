"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ObservabilityPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [message, setMessage] = useState("Loading runtime observability...")

  async function loadObservability() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const workspaceResponse = await fetch("/api/workspace/current", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      `/api/memory/runtime-snapshot?workspaceId=${currentWorkspace.id}`,
      { cache: "no-store" }
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || "Failed to load runtime snapshots.")
      return
    }

    setSnapshots(data.snapshots || [])
    setMessage("")
  }

  useEffect(() => {
    loadObservability()
  }, [])

  const latest = snapshots[0]

  const runtimeStats = useMemo(() => {
    const totalCycles = snapshots.length
    const totalSignals = snapshots.reduce(
      (sum, item) => sum + Number(item.total_signals || 0),
      0
    )
    const totalFailures = snapshots.reduce(
      (sum, item) => sum + Number(item.failed_agents || 0),
      0
    )
    const avgReadiness = Math.round(
      snapshots.reduce((sum, item) => sum + Number(item.readiness_score || 0), 0) /
        Math.max(totalCycles, 1)
    )

    return {
      totalCycles,
      totalSignals,
      totalFailures,
      avgReadiness,
    }
  }, [snapshots])

  const readinessDelta =
    snapshots.length >= 2
      ? Number(snapshots[0].readiness_score || 0) -
        Number(snapshots[1].readiness_score || 0)
      : 0

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          AI Runtime Control Tower
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Executive Intelligence & Observability
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Monitor autonomous agent cycles, runtime memory, readiness scoring,
          operational signals, and AI platform health.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Runtime Cycles", runtimeStats.totalCycles],
            ["Total Signals", runtimeStats.totalSignals],
            ["Agent Failures", runtimeStats.totalFailures],
            ["Avg Readiness", `${runtimeStats.avgReadiness}%`],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Workspace: {workspace?.name || "Loading..."}
        </p>

        <button
          onClick={loadObservability}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Observability
        </button>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Latest Runtime Health</h2>

          <div className="mt-5 space-y-4">
            {[
              ["Readiness Score", `${latest?.readiness_score || 0}%`],
              ["Readiness Delta", readinessDelta > 0 ? `+${readinessDelta}` : readinessDelta],
              ["Signals", latest?.total_signals || 0],
              ["Failed Agents", latest?.failed_agents || 0],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between border-b pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Engagement Integrity</h2>

          <div className="mt-5 space-y-4">
            {[
              ["Open Rate", `${latest?.open_rate || 0}%`],
              ["Click Rate", `${latest?.click_rate || 0}%`],
              ["Reply Rate", `${latest?.reply_rate || 0}%`],
              ["Engagement Events", latest?.engagement_events || 0],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between border-b pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Revenue Ops Memory</h2>

          <div className="mt-5 space-y-4">
            {[
              ["Contacts", latest?.contacts_count || 0],
              ["Sent Emails", latest?.sent_emails || 0],
              ["Snapshot Source", latest?.source || "agent_runtime"],
              [
                "Last Cycle",
                latest?.created_at
                  ? new Date(latest.created_at).toLocaleString()
                  : "No cycle yet",
              ],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between border-b pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Runtime Snapshot Timeline</h2>

        <div className="mt-6 space-y-4">
          {snapshots.length ? (
            snapshots.map((snapshot) => (
              <article
                key={snapshot.id}
                className="grid gap-4 rounded-xl border p-5 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {snapshot.source}
                    </span>
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {snapshot.total_signals} signals
                    </span>
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {snapshot.failed_agents} failures
                    </span>
                  </div>

                  <h3 className="mt-3 font-semibold">
                    Runtime cycle captured
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Contacts: {snapshot.contacts_count} · Sent:{" "}
                    {snapshot.sent_emails} · Events:{" "}
                    {snapshot.engagement_events} · Reply Rate:{" "}
                    {snapshot.reply_rate}%
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(snapshot.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border p-4 text-center">
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {snapshot.readiness_score}%
                  </p>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No runtime snapshots yet. Trigger the agent runtime to capture memory.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
