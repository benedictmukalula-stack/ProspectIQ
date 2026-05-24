"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { FeatureGate } from "../components/features/feature-gate"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RepliesPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [body, setBody] = useState("")
  const [result, setResult] = useState<any>(null)

  async function loadWorkspace() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const response = await fetch("/api/workspace/current", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: session?.user?.id,
        email: session?.user?.email,
      }),
    })

    const data = await response.json()
    setWorkspace(data.workspace)
  }

  async function processReply() {
    if (!workspace?.id || !body.trim()) return

    const response = await fetch("/api/replies/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceId: workspace.id,
        subject: "Re: ProspectIQ",
        body,
      }),
    })

    const data = await response.json()
    setResult(data)
  }

  useEffect(() => {
    loadWorkspace()
  }, [])

  return (
    <FeatureGate
      feature="advanced_analytics"
      title="Reply intelligence requires Business"
      description="Upgrade to Business to unlock AI reply analysis and autonomous sales workflows."
    >
      <main className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">
            AI Reply Intelligence
          </h1>

          <p className="text-sm text-muted-foreground">
            Analyze inbound prospect replies, classify intent, and trigger automated sales actions.
          </p>
        </div>

        <section className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Simulate inbound reply
          </h2>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Example: This looks interesting. Can we schedule a demo next week?"
            className="min-h-[180px] w-full rounded-lg border bg-background p-4 text-sm"
          />

          <button
            onClick={processReply}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Analyze Reply
          </button>
        </section>

        {result?.error && (
          <section className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Reply processing error</h2>
            <p className="mt-2 text-sm text-red-600">{result.error}</p>
          </section>
        )}

        {result?.taskCreated !== undefined && (
          <section className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Task creation status</h2>
            <p className="mt-2 text-sm">
              Task created: {String(result.taskCreated)}
            </p>
            {result?.task?.id && (
              <p className="text-xs text-muted-foreground">Task ID: {result.task.id}</p>
            )}
          </section>
        )}

        {result?.intelligence && (
          <section className="rounded-xl border p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">
                Classification Result
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">
                  Classification
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {result.intelligence.classification}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">
                  Sentiment
                </p>

                <p className="mt-1 text-lg font-semibold capitalize">
                  {result.intelligence.sentiment}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">
                  Confidence
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {Math.round(result.intelligence.confidence * 100)}%
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">
                  Suggested Action
                </p>

                <p className="mt-1 text-sm">
                  {result.intelligence.suggestedAction}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">
                AI Summary
              </p>

              <p className="mt-2 text-sm">
                {result.intelligence.summary}
              </p>
            </div>
          </section>
        )}
      </main>
    </FeatureGate>
  )
}
