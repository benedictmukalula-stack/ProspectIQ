"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ExecutiveDashboardPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [data, setData] = useState<any>({})
  const [message, setMessage] = useState("Loading executive intelligence...")

  async function loadExecutiveDashboard() {
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

    const [
      intelligenceResponse,
      predictionResponse,
      graphResponse,
      snapshotsResponse,
      approvalsResponse,
      benchmarkResponse,
      runtimeResponse,
    ] = await Promise.all([
      fetch("/api/dashboard/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: currentWorkspace.id }),
        cache: "no-store",
      }),
      fetch("/api/prediction/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: currentWorkspace.id }),
        cache: "no-store",
      }),
      fetch(`/api/graph/workspace?workspaceId=${currentWorkspace.id}`, {
        cache: "no-store",
      }),
      fetch(`/api/memory/runtime-snapshot?workspaceId=${currentWorkspace.id}`, {
        cache: "no-store",
      }),
      fetch(`/api/governance/approvals?workspaceId=${currentWorkspace.id}`, {
        cache: "no-store",
      }),
      fetch("/api/benchmarking/overview", {
        cache: "no-store",
      }),
      fetch("/api/agents/runtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          createEvents: false,
        }),
        cache: "no-store",
      }),
    ])

    const [
      intelligence,
      prediction,
      graph,
      snapshots,
      approvals,
      benchmarks,
      runtime,
    ] = await Promise.all([
      intelligenceResponse.json(),
      predictionResponse.json(),
      graphResponse.json(),
      snapshotsResponse.json(),
      approvalsResponse.json(),
      benchmarkResponse.json(),
      runtimeResponse.json(),
    ])

    setData({
      intelligence,
      prediction,
      graph,
      snapshots,
      approvals,
      benchmarks,
      runtime,
    })

    setMessage("")
  }

  useEffect(() => {
    loadExecutiveDashboard()
  }, [])

  const intelligence = data.intelligence?.intelligence
  const prediction = data.prediction?.prediction
  const graphSummary = data.graph?.graph?.summary
  const snapshots = data.snapshots?.snapshots || []
  const approvals = data.approvals?.approvals || []
  const benchmarkSummary = data.benchmarks?.summary
  const runtime = data.runtime

  const executiveScore = useMemo(() => {
    const readiness = Number(snapshots[0]?.readiness_score || 0)
    const conversion = Number(prediction?.conversionProbability || 0)
    const risk = Number(prediction?.pipelineRiskScore || 0)
    const failures = Number(runtime?.failedAgents || 0)

    return Math.max(
      0,
      Math.min(100, Math.round(readiness * 0.35 + conversion * 0.35 + (100 - risk) * 0.25 - failures * 5))
    )
  }, [snapshots, prediction, runtime])

  const pendingApprovals = approvals.filter((item: any) => item.status === "pending").length

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">Enterprise AI Mission Control</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Global Executive Super Dashboard
        </h1>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
          Unified command center for runtime health, predictive intelligence,
          governance approvals, operational memory, tenant benchmarking,
          command graph topology, and autonomous revenue execution.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["Executive Score", `${executiveScore}%`],
            ["Runtime Signals", runtime?.totalSignals || 0],
            ["Pending Approvals", pendingApprovals],
            ["Prediction", prediction?.forecastLabel || "loading"],
            ["Tenant Avg", `${benchmarkSummary?.avgReadiness || 0}%`],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-3xl font-semibold capitalize">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Workspace: {workspace?.name || "Loading..."}
        </p>

        <button
          onClick={loadExecutiveDashboard}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Mission Control
        </button>
      </div>

      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Predictive Revenue Outlook</h2>

          <div className="mt-5 space-y-4">
            {[
              ["Conversion Probability", `${prediction?.conversionProbability || 0}%`],
              ["Engagement Forecast", `${prediction?.engagementForecast || 0}%`],
              ["Pipeline Risk", `${prediction?.pipelineRiskScore || 0}%`],
              ["Anomaly Score", `${prediction?.anomalyScore || 0}%`],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between border-b pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Runtime Health</h2>

          <div className="mt-5 space-y-4">
            {[
              ["Executed Agents", runtime?.results?.length || 0],
              ["Failed Agents", runtime?.failedAgents || 0],
              ["Runtime Signals", runtime?.totalSignals || 0],
              ["Snapshots", snapshots.length],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between border-b pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Command Graph</h2>

          <div className="mt-5 space-y-4">
            {[
              ["Nodes", graphSummary?.nodes || 0],
              ["Edges", graphSummary?.edges || 0],
              ["Signals", graphSummary?.signals || 0],
              ["Density", `${graphSummary?.graphDensity || 0}%`],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between border-b pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Strategic Recommendations</h2>

          <div className="mt-5 space-y-3">
            {(prediction?.recommendations || []).length ? (
              prediction.recommendations.map((item: string, index: number) => (
                <div key={index} className="rounded-xl border p-4 text-sm">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No strategic recommendations available yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Governance Watchlist</h2>

          <div className="mt-5 space-y-3">
            {approvals.slice(0, 5).map((approval: any) => (
              <div key={approval.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{approval.title}</p>
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {approval.status}
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {approval.category} · confidence {approval.confidence}%
                </p>
              </div>
            ))}

            {!approvals.length && (
              <p className="text-sm text-muted-foreground">
                No governance approvals yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        {[
          ["Contacts", intelligence?.summary?.contacts || 0, "/dashboard/leads"],
          ["AI Workflows", intelligence?.summary?.aiWorkflows || 0, "/dashboard/ai-workflows"],
          ["Benchmarks", benchmarkSummary?.totalWorkspaces || 0, "/dashboard/benchmarks"],
          ["Execution", "Open", "/dashboard/execution"],
        ].map(([label, value, href]) => (
          <a key={String(label)} href={String(href)} className="rounded-2xl border p-6 hover:bg-muted">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </a>
        ))}
      </section>
    </main>
  )
}