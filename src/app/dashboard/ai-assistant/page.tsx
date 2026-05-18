"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AIAssistantPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)

  const [intelligence, setIntelligence] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [executiveSummary, setExecutiveSummary] = useState<any>(null)

  const [history, setHistory] = useState<any[]>([])
  const [answer, setAnswer] = useState("")

  async function loadWorkspaceContext() {
    setLoading(true)

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
      setLoading(false)
      return
    }

    const [
      intelligenceResponse,
      recommendationResponse,
      actionResponse,
      eventResponse,
    ] = await Promise.all([
      fetch("/api/dashboard/intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
        }),
      }),

      fetch("/api/ai/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
        }),
      }),

      fetch("/api/ai/autonomous-actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
        }),
      }),

      fetch(
        `/api/workspace/events?workspaceId=${currentWorkspace.id}`
      ),
    ])

    const intelligenceData = await intelligenceResponse.json()
    const recommendationData = await recommendationResponse.json()
    const actionData = await actionResponse.json()
    const eventData = await eventResponse.json()

    setIntelligence(intelligenceData.intelligence || null)
    setRecommendations(recommendationData.recommendations || [])
    setExecutiveSummary(recommendationData.executiveSummary || null)
    setActions(actionData.actions || [])
    setEvents(eventData.events || [])

    setLoading(false)
  }

  useEffect(() => {
    loadWorkspaceContext()
  }, [])

  const operationalScore = useMemo(() => {
    const total =
      recommendations.length +
      actions.length +
      events.length

    return Math.min(98, 60 + total)
  }, [recommendations, actions, events])

  function askAssistant() {
    if (!question.trim()) return

    const response = `
Executive Operational Intelligence

Workspace Operational Score: ${operationalScore}/100

Key Findings:
- ${recommendations.length} strategic recommendations detected
- ${actions.length} autonomous actions available
- ${events.length} telemetry events processed

Executive Summary:
${executiveSummary?.narrative || "Workspace intelligence available."}

Recommended Focus:
${executiveSummary?.focus || "Improve operational execution and outbound readiness."}

Top Autonomous Actions:
${actions
  .slice(0, 3)
  .map((item: any, index: number) => `${index + 1}. ${item.title}`)
  .join("\n")}

Strategic Recommendations:
${recommendations
  .slice(0, 3)
  .map((item: any, index: number) => `${index + 1}. ${item.title}`)
  .join("\n")}
`

    setAnswer(response)

    setHistory((current) => [
      {
        question,
        answer: response,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])

    setQuestion("")
  }

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          ProspectIQ Executive Copilot
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          AI Operational Intelligence
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Centralized AI workspace copilot powered by realtime telemetry,
          autonomous actions, operational recommendations, and executive intelligence.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Operational Score", `${operationalScore}/100`],
            ["Recommendations", recommendations.length],
            ["Autonomous Actions", actions.length],
            ["Telemetry Events", events.length],
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

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Executive AI Copilot
              </h2>

              <p className="text-sm text-muted-foreground">
                Workspace:
                {" "}
                {workspace?.name || "Loading workspace..."}
              </p>
            </div>

            <button
              onClick={loadWorkspaceContext}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Refresh Intelligence
            </button>
          </div>

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask the executive AI copilot what operational actions should happen next..."
            className="mt-6 min-h-40 w-full rounded-xl border p-4 text-sm"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={askAssistant}
              disabled={loading}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white"
            >
              {loading ? "Loading..." : "Ask Copilot"}
            </button>

            <button
              onClick={() => setQuestion("")}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Clear
            </button>
          </div>

          {answer && (
            <div className="mt-6 rounded-xl bg-muted p-5">
              <h2 className="font-semibold">
                Executive Intelligence Response
              </h2>

              <pre className="mt-3 whitespace-pre-wrap text-sm font-sans leading-6">
                {answer}
              </pre>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">
              Autonomous Actions
            </h2>

            <div className="mt-4 space-y-3">
              {actions.slice(0, 5).map((action: any, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{action.title}</p>

                    <span className="rounded-full border px-2 py-1 text-xs">
                      {action.priority}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {action.recommendedAction}
                  </p>

                  <a
                    href={action.href}
                    className="mt-3 inline-flex text-sm underline"
                  >
                    Open Module
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">
              Executive Summary
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <p>
                {executiveSummary?.narrative ||
                  "Executive workspace intelligence is loading."}
              </p>

              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium">Recommended Focus</p>

                <p className="mt-1 text-muted-foreground">
                  {executiveSummary?.focus}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Recent Copilot Conversations
        </h2>

        <div className="mt-4 space-y-3">
          {history.length ? (
            history.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border p-4"
              >
                <p className="font-medium">{item.question}</p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No executive copilot conversations yet.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
