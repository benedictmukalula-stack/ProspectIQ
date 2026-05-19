"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SemanticDashboardPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [message, setMessage] = useState(
    "Loading semantic intelligence..."
  )

  async function loadSemanticLayer() {
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
      `/api/semantic/workspace?workspaceId=${currentWorkspace.id}`,
      {
        cache: "no-store",
      }
    )

    const result = await response.json()

    if (!response.ok) {
      setMessage(
        result.error ||
          "Failed to load semantic intelligence."
      )
      return
    }

    setData(result)
    setMessage("")
  }

  useEffect(() => {
    loadSemanticLayer()
  }, [])

  const semanticGraph =
    data?.semanticGraph || {}

  const ranking =
    data?.priorityRanking || []

  const topInsights = useMemo(
    () => semanticGraph.insights || [],
    [semanticGraph]
  )

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          Semantic Intelligence Engine
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          AI Operational Knowledge Graph
        </h1>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
          Semantic organizational memory and
          contextual intelligence layer for AI
          reasoning, entity relationships,
          operational context, and enterprise
          knowledge synthesis.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            [
              "Semantic Health",
              `${semanticGraph.semanticHealth || 0}%`,
            ],
            [
              "Entities",
              semanticGraph.entities?.length || 0,
            ],
            [
              "Relationships",
              semanticGraph.relationships?.length || 0,
            ],
            [
              "Insights",
              semanticGraph.insights?.length || 0,
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
          onClick={loadSemanticLayer}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Semantic Layer
        </button>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">
            Semantic Insights
          </h2>

          <div className="mt-5 space-y-3">
            {topInsights.length ? (
              topInsights.map(
                (insight: string, index: number) => (
                  <div
                    key={index}
                    className="rounded-xl border p-4 text-sm"
                  >
                    {insight}
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                No semantic insights available.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">
            Knowledge Priority Ranking
          </h2>

          <div className="mt-5 space-y-3">
            {ranking.map((entity: any) => (
              <div
                key={entity.id}
                className="rounded-xl border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      #{entity.rank} {entity.label}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {entity.type}
                    </p>
                  </div>

                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {entity.semanticScore}
                  </span>
                </div>
              </div>
            ))}

            {!ranking.length && (
              <p className="text-sm text-muted-foreground">
                No semantic ranking available.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">
          Relationship Reasoning
        </h2>

        <div className="mt-5 space-y-3">
          {(semanticGraph.relationships || [])
            .slice(0, 20)
            .map((relationship: any, index: number) => (
              <div
                key={index}
                className="rounded-xl border p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    confidence{" "}
                    {relationship.confidence}%
                  </span>

                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {relationship.type}
                  </span>
                </div>

                <p className="mt-3 text-sm">
                  {relationship.source} →{" "}
                  {relationship.target}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {relationship.reasoning}
                </p>
              </div>
            ))}

          {!semanticGraph.relationships?.length && (
            <p className="text-sm text-muted-foreground">
              No semantic relationships available.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
