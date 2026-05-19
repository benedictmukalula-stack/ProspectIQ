"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function InfrastructurePage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [message, setMessage] = useState("Loading autonomous infrastructure intelligence...")

  async function loadInfrastructure() {
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

    const response = await fetch("/api/infrastructure/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: currentWorkspace.id }),
      cache: "no-store",
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error || "Failed to load infrastructure intelligence.")
      return
    }

    setData(result)
    setMessage("")
  }

  useEffect(() => {
    loadInfrastructure()
  }, [])

  const infrastructure = data?.infrastructure || {}
  const summary = infrastructure.summary || {}
  const risks = infrastructure.risks || []

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-8 text-white">
        <p className="text-sm text-cyan-300">Autonomous Infrastructure Operations</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Infrastructure Resilience Center
        </h1>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
          Monitor runtime resilience, deployment readiness, configuration risk,
          security posture, autonomous recovery availability, and platform health.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["Resilience", `${summary.resilienceScore || 0}%`],
            ["Total Risks", summary.total || 0],
            ["Critical", summary.critical || 0],
            ["High", summary.high || 0],
            ["Self-Healing", summary.selfHealingAvailable || 0],
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
          onClick={loadInfrastructure}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Infrastructure
        </button>
      </div>

      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

      <section className="grid gap-6">
        {risks.length ? (
          risks.map((risk: any) => (
            <article key={risk.id} className="rounded-2xl border p-6">
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
                      impact {risk.scoreImpact}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold">{risk.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{risk.impact}</p>
                </div>

                <span className="rounded-lg border px-4 py-2 text-sm">
                  {risk.selfHealingAvailable ? "Self-Healing Available" : "Manual Fix"}
                </span>
              </div>

              <div className="mt-5 rounded-xl border p-4">
                <p className="text-sm font-medium">Recommended Remediation</p>
                <p className="mt-2 text-sm text-muted-foreground">{risk.recommendation}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border p-8 text-sm text-muted-foreground">
            No infrastructure risks detected.
          </div>
        )}
      </section>
    </main>
  )
}
