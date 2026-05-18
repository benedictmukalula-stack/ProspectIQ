"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PredictionsPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [message, setMessage] = useState("Loading predictive intelligence...")

  async function loadPredictions() {
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

    const response = await fetch("/api/prediction/workspace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceId: currentWorkspace.id,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error || "Failed to load predictions.")
      return
    }

    setData(result)
    setMessage("")
  }

  useEffect(() => {
    loadPredictions()
  }, [])

  const prediction = data?.prediction || {}

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          Predictive Revenue Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Signal Forecasting Engine
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Forecast conversion probability, engagement quality, pipeline risk,
          and telemetry anomalies using normalized intelligence and command graph signals.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["Conversion", `${prediction.conversionProbability || 0}%`],
            ["Engagement", `${prediction.engagementForecast || 0}%`],
            ["Pipeline Risk", `${prediction.pipelineRiskScore || 0}%`],
            ["Anomaly", `${prediction.anomalyScore || 0}%`],
            ["Forecast", prediction.forecastLabel || "loading"],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-2xl font-semibold capitalize">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Workspace: {workspace?.name || "Loading..."}
        </p>

        <button
          onClick={loadPredictions}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Forecast
        </button>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Forecast Recommendations</h2>

          <div className="mt-5 space-y-3">
            {(prediction.recommendations || []).length ? (
              prediction.recommendations.map((item: string, index: number) => (
                <div key={index} className="rounded-xl border p-4 text-sm">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No predictive recommendations yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Model Inputs</h2>

          <div className="mt-5 space-y-4">
            {[
              ["Contacts", data?.intelligence?.summary?.contacts || 0],
              ["Active Sequences", data?.intelligence?.summary?.activeSequences || 0],
              ["Sent Emails", data?.intelligence?.summary?.sentEmails || 0],
              ["Reply Rate", `${data?.intelligence?.performance?.replyRate || 0}%`],
              ["Graph Nodes", data?.graphSummary?.nodes || 0],
              ["Graph Edges", data?.graphSummary?.edges || 0],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between border-b pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
