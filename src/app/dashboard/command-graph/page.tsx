"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CommandGraphPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [graph, setGraph] = useState<any>(null)
  const [selectedType, setSelectedType] = useState("all")
  const [message, setMessage] = useState("Loading command graph...")

  async function loadGraph() {
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
      `/api/graph/workspace?workspaceId=${currentWorkspace.id}`,
      { cache: "no-store" }
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || "Failed to load command graph.")
      return
    }

    setGraph(data.graph)
    setMessage("")
  }

  useEffect(() => {
    loadGraph()
  }, [])

  const nodes = useMemo(() => {
    const all = graph?.nodes || []
    if (selectedType === "all") return all
    return all.filter((node: any) => node.type === selectedType)
  }, [graph, selectedType])

  const summary = graph?.summary || {}

  const nodeTypes = ["all", "workspace", "contact", "sequence", "email", "signal", "workflow", "agent"]

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">Enterprise AI Command Graph</p>

        <h1 className="mt-2 text-3xl font-bold">
          Relationship Intelligence Layer
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Map relationships between workspace operations, contacts, sequences,
          outbound messages, engagement signals, workflows, and autonomous agents.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-6">
          {[
            ["Nodes", summary.nodes || 0],
            ["Edges", summary.edges || 0],
            ["Contacts", summary.contacts || 0],
            ["Sequences", summary.sequences || 0],
            ["Signals", summary.signals || 0],
            ["Density", `${summary.graphDensity || 0}%`],
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
          onClick={loadGraph}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Graph
        </button>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Graph Filters</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {nodeTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-lg border px-4 py-2 text-sm capitalize hover:bg-muted ${
                selectedType === type ? "bg-muted" : ""
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Entity Nodes</h2>

          <div className="mt-5 space-y-3">
            {nodes.length ? (
              nodes.map((node: any) => (
                <div
                  key={node.id}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{node.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {node.type} · {node.id}
                      </p>
                    </div>

                    {typeof node.score === "number" && (
                      <span className="rounded-full border px-2 py-0.5 text-xs">
                        {node.score}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No nodes found for this filter.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Relationship Edges</h2>

          <div className="mt-5 space-y-3">
            {(graph?.edges || []).map((edge: any) => (
              <div
                key={edge.id}
                className="rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{edge.type}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {edge.source} → {edge.target}
                    </p>
                  </div>

                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {edge.strength}
                  </span>
                </div>
              </div>
            ))}

            {!(graph?.edges || []).length && (
              <p className="text-sm text-muted-foreground">
                No relationships found yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
