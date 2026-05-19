"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RiskDashboardPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [message, setMessage] = useState(
    "Loading operational risk intelligence..."
  )

  async function loadRiskCenter() {
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
      "/api/risk/workspace",
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
        result.error ||
          "Risk intelligence unavailable."
      )
      return
    }

    setData(result)
    setMessage("")
  }

  useEffect(() => {
    loadRiskCenter()
  }, [])

  const summary = data?.summary || {}
  const risks = data?.risks || []

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-red-950 via-slate-900 to-black p-8 text-white">
        <p className="text-sm text-red-300">
          Enterprise Risk Intelligence
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Risk Reduction Control Center
        </h1>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
          Centralized operational risk detection,
          blocker management, infrastructure
          readiness analysis, and enterprise
          stabilization workflows.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            [
              "Risk Score",
              `${summary.operationalRiskScore || 0}%`,
            ],
            [
              "Critical",
              summary.critical || 0,
            ],
            ["High", summary.high || 0],
            [
              "Medium",
              summary.medium || 0,
            ],
            ["Total", summary.total || 0],
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
          onClick={loadRiskCenter}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Risk Center
        </button>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="space-y-4">
        {risks.length ? (
          risks.map((risk: any) => (
            <div
              key={risk.id}
              className="rounded-2xl border p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {risk.severity}
                    </span>

                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {risk.category}
                    </span>

                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      score {risk.score}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold">
                    {risk.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {risk.impact}
                  </p>
                </div>

                <a
                  href={risk.resolutionPath}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                >
                  Resolve
                </a>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm font-medium">
                    Recommendation
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {risk.recommendation}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm font-medium">
                    Automation
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {risk.automated
                      ? "AI-assisted remediation available."
                      : "Manual operational remediation required."}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border p-8 text-sm text-muted-foreground">
            No operational risks detected.
          </div>
        )}
      </section>
    </main>
  )
}
