"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CouncilPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [message, setMessage] = useState("Loading AI executive council...")

  async function loadCouncil() {
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

    const response = await fetch("/api/council/executive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: currentWorkspace.id }),
      cache: "no-store",
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error || "Failed to load council.")
      return
    }

    setData(result)
    setMessage("")
  }

  useEffect(() => {
    loadCouncil()
  }, [])

  const consensus = data?.consensus || {}
  const opinions = data?.opinions || []

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">Multi-Agent Cognitive Coordination</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          AI Executive Council
        </h1>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
          Coordinated multi-agent deliberation layer for strategic governance,
          executive consensus, distributed reasoning, and autonomous decision alignment.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["Decision", consensus.decision || "loading"],
            ["Consensus", `${consensus.consensusScore || 0}%`],
            ["Support", consensus.support || 0],
            ["Caution", consensus.caution || 0],
            ["Block", consensus.block || 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-2xl font-semibold capitalize">{String(value).replaceAll("_", " ")}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Workspace: {workspace?.name || "Loading..."}
        </p>

        <button
          onClick={loadCouncil}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Refresh Council
        </button>
      </div>

      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

      <section className="grid gap-6">
        {opinions.map((opinion: any, index: number) => (
          <article key={index} className="rounded-2xl border p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {opinion.position}
                  </span>
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    confidence {opinion.confidence}%
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-semibold">{opinion.agent}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{opinion.role}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="text-sm font-medium">Reasoning</p>
                <p className="mt-2 text-sm text-muted-foreground">{opinion.reasoning}</p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm font-medium">Recommendation</p>
                <p className="mt-2 text-sm text-muted-foreground">{opinion.recommendation}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
