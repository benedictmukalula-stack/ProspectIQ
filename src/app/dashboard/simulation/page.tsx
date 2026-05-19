"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SimulationPage() {
  const [workspace, setWorkspace] =
    useState<any>(null)

  const [data, setData] =
    useState<any>(null)

  const [message, setMessage] =
    useState(
      "Loading enterprise simulation runtime..."
    )

  async function loadSimulation() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const workspaceResponse = await fetch(
      "/api/workspace/current",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          email: session?.user?.email,
        }),
      }
    )

    const workspaceData =
      await workspaceResponse.json()

    const currentWorkspace =
      workspaceData.workspace

    setWorkspace(currentWorkspace)

    if (!currentWorkspace?.id) {
      setMessage("Workspace not found.")
      return
    }

    const response = await fetch(
      "/api/simulation/workspace",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          workspaceId:
            currentWorkspace.id,
        }),
      }
    )

    const result =
      await response.json()

    if (!response.ok) {
      setMessage(
        result.error ||
          "Simulation runtime unavailable."
      )
      return
    }

    setData(result)
    setMessage("")
  }

  useEffect(() => {
    loadSimulation()
  }, [])

  const summary =
    data?.summary || {}

  const scenarios =
    data?.scenarios || []

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-8 text-white">
        <p className="text-sm text-indigo-300">
          Enterprise Simulation Runtime
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Autonomous Enterprise Simulation
        </h1>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
          AI-powered enterprise scenario
          forecasting, operational branch
          modeling, governance consequence
          prediction, and strategic future-state
          simulation.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            [
              "Readiness",
              `${summary.enterpriseReadiness || 0}%`,
            ],
            [
              "Scenarios",
              summary.totalScenarios || 0,
            ],
            [
              "Positive",
              summary.positive || 0,
            ],
            [
              "Negative",
              summary.negative || 0,
            ],
            [
              "Revenue Impact",
              `${summary.projectedRevenueImpact || 0}%`,
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
          Workspace:{" "}
          {workspace?.name || "Loading..."}
        </p>

        <button
          onClick={loadSimulation}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Simulation
        </button>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="space-y-4">
        {scenarios.length ? (
          scenarios.map((scenario: any) => (
            <div
              key={scenario.id}
              className="rounded-2xl border p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {scenario.category}
                    </span>

                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {scenario.impact}
                    </span>

                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      probability{" "}
                      {scenario.probability}%
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold">
                    {scenario.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {scenario.forecast}
                  </p>
                </div>

                <div className="rounded-xl border p-3 text-sm">
                  {scenario.timeline}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm font-medium">
                    Recommendation
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {scenario.recommendation}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm font-medium">
                    Projected Outcome
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p>
                      Revenue:{" "}
                      {
                        scenario
                          .projectedOutcome
                          ?.revenueChange
                      }
                      %
                    </p>

                    <p>
                      Risk:{" "}
                      {
                        scenario
                          .projectedOutcome
                          ?.riskChange
                      }
                      %
                    </p>

                    <p>
                      Readiness:{" "}
                      {
                        scenario
                          .projectedOutcome
                          ?.readinessChange
                      }
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border p-8 text-sm text-muted-foreground">
            No simulation scenarios available.
          </div>
        )}
      </section>
    </main>
  )
}
