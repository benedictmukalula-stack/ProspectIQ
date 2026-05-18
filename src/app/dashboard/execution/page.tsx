"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ExecutionPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(
    "Preparing autonomous execution runtime..."
  )

  async function runExecution() {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const workspaceResponse = await fetch(
      "/api/workspace/current",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          email: session?.user?.email,
        }),
      }
    )

    const workspaceData = await workspaceResponse.json()
    const currentWorkspace = workspaceData.workspace

    setWorkspace(currentWorkspace)

    if (!currentWorkspace?.id) {
      setMessage("Workspace not found.")
      setLoading(false)
      return
    }

    const response = await fetch(
      "/api/execution/runtime",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      setMessage(
        result.error || "Execution runtime failed."
      )
      setLoading(false)
      return
    }

    setData(result)
    setMessage("")
    setLoading(false)
  }

  useEffect(() => {
    runExecution()
  }, [])

  const optimization = data?.optimization || {}
  const execution = data?.execution || {}

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          Autonomous Revenue Execution
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Self-Optimizing Revenue Runtime
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Automatically detect operational weaknesses, generate
          AI-driven optimizations, and execute autonomous recovery actions.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            [
              "Actions",
              optimization.summary?.totalActions || 0,
            ],
            [
              "Autonomous",
              optimization.summary?.autonomousActions || 0,
            ],
            [
              "Projected Impact",
              `${optimization.summary?.projectedImpact || 0}%`,
            ],
            [
              "Executed",
              execution.executedCount || 0,
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs text-slate-300">
                {label}
              </p>

              <p className="mt-2 text-3xl font-semibold">
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
          onClick={runExecution}
          disabled={loading}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          {loading
            ? "Running Runtime..."
            : "Run Autonomous Runtime"}
        </button>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">
          Optimization Actions
        </h2>

        <div className="mt-5 space-y-4">
          {(optimization.actions || []).length ? (
            optimization.actions.map(
              (action: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border p-5"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {action.priority}
                    </span>

                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {action.automationLevel}
                    </span>

                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      impact {action.expectedImpact}%
                    </span>
                  </div>

                  <h3 className="mt-3 font-semibold">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {action.description}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Target: {action.target}
                  </p>
                </div>
              )
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              No optimization actions available.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
