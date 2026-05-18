"use client"

import { useEffect, useMemo, useState } from "react"

export default function BenchmarksPage() {
  const [data, setData] = useState<any>(null)
  const [message, setMessage] = useState("Loading tenant benchmarks...")

  async function loadBenchmarks() {
    const response = await fetch(
      "/api/benchmarking/overview",
      { cache: "no-store" }
    )

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error || "Failed to load benchmarks.")
      return
    }

    setData(result)
    setMessage("")
  }

  useEffect(() => {
    loadBenchmarks()
  }, [])

  const summary = useMemo(
    () => data?.summary || {},
    [data]
  )

  const rankings = useMemo(
    () => data?.rankings || [],
    [data]
  )

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          Enterprise Benchmark Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Tenant Analytics & Operational Rankings
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Compare workspace operational health, readiness scoring,
          engagement quality, runtime stability, and AI maturity across
          the ProspectIQ intelligence network.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["Workspaces", summary.totalWorkspaces || 0],
            ["Avg Readiness", `${summary.avgReadiness || 0}%`],
            ["Avg Reply", `${summary.avgReplyRate || 0}%`],
            ["Signals", summary.totalSignals || 0],
            ["Failures", summary.totalFailures || 0],
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

      <div className="flex justify-end">
        <button
          onClick={loadBenchmarks}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Benchmarks
        </button>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-8 gap-4 border-b bg-muted/40 p-4 text-xs font-medium uppercase tracking-wide">
          <div>Rank</div>
          <div className="col-span-2">Workspace</div>
          <div>Health</div>
          <div>Readiness</div>
          <div>Reply</div>
          <div>Signals</div>
          <div>Failures</div>
        </div>

        {rankings.length ? (
          rankings.map((workspace: any, index: number) => (
            <div
              key={workspace.workspaceId}
              className="grid grid-cols-8 gap-4 border-b p-4 text-sm last:border-0"
            >
              <div className="font-semibold">
                #{index + 1}
              </div>

              <div className="col-span-2 truncate">
                {workspace.workspaceName}
              </div>

              <div>{workspace.healthScore}%</div>

              <div>{workspace.readinessScore}%</div>

              <div>{workspace.replyRate}%</div>

              <div>{workspace.totalSignals}</div>

              <div>{workspace.failedAgents}</div>
            </div>
          ))
        ) : (
          <div className="p-8 text-sm text-muted-foreground">
            No benchmark intelligence available yet.
          </div>
        )}
      </section>
    </main>
  )
}
