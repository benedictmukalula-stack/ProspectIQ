"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StrategyPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [message, setMessage] = useState("Loading cognitive strategic planner...")

  async function loadStrategy() {
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

    const response = await fetch("/api/cognition/strategy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: currentWorkspace.id }),
      cache: "no-store",
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error || "Failed to load strategic plan.")
      return
    }

    setData(result)
    setMessage("")
  }

  useEffect(() => {
    loadStrategy()
  }, [])

  const summary = data?.summary || {}
  const initiatives = data?.initiatives || []

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          AI Cognitive Runtime
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Autonomous Strategic Planning
        </h1>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
          Long-horizon strategic planning layer for objective decomposition,
          initiative generation, operational goal setting, and cognitive execution planning.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["Readiness", `${summary.strategicReadiness || 0}%`],
            ["Initiatives", summary.totalInitiatives || 0],
            ["High Priority", summary.highPriority || 0],
            ["Short Term", summary.shortTerm || 0],
            ["Mid Term", summary.midTerm || 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-white/10 bg-white/5 p-4">
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
          onClick={loadStrategy}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Strategy
        </button>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="grid gap-6">
        {initiatives.length ? (
          initiatives.map((initiative: any, index: number) => (
            <article key={index} className="rounded-2xl border p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {initiative.priority}
                    </span>

                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {initiative.horizon}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold">
                    {initiative.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {initiative.objective}
                  </p>

                  <p className="mt-3 text-sm font-medium">
                    Success Metric: {initiative.successMetric}
                  </p>
                </div>

                <a
                  href={initiative.linkedModule}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                >
                  Open Module
                </a>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {initiative.steps.map((step: string, stepIndex: number) => (
                  <div key={stepIndex} className="rounded-xl border p-4 text-sm">
                    <span className="font-medium">Step {stepIndex + 1}: </span>
                    {step}
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border p-8 text-sm text-muted-foreground">
            No strategic initiatives required right now.
          </div>
        )}
      </section>
    </main>
  )
}
