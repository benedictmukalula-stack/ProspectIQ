"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { FeatureGate } from "@/components/features/feature-gate"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SendQueuePage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [message, setMessage] = useState("")

  async function loadWorkspace() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const response = await fetch("/api/workspace/current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session?.user?.id,
        email: session?.user?.email,
      }),
    })

    const data = await response.json()
    setWorkspace(data.workspace)
  }

  async function buildQueue() {
    if (!workspace?.id) return

    const response = await fetch("/api/outbound/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id }),
    })

    const data = await response.json()
    setMessage(response.ok ? `Queued ${data.queued?.length || 0} message(s).` : data.error)
  }

  async function sendQueued() {
    if (!workspace?.id) return

    const response = await fetch("/api/outbound/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id }),
    })

    const data = await response.json()
    setMessage(response.ok ? `Sent ${data.sent?.length || 0} message(s).` : data.error)
  }

  useEffect(() => {
    loadWorkspace()
  }, [])

  return (
    <FeatureGate
      feature="campaigns"
      title="Send queue requires campaign access"
      description="Upgrade to manage outbound sequence delivery and sending infrastructure."
    >
      <main className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Send Queue</h1>
          <p className="text-sm text-muted-foreground">
            Queue due sequence messages and simulate outbound delivery before connecting a real email provider.
          </p>
        </div>

        <section className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Sequence delivery controls</h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={buildQueue}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Build Send Queue
            </button>

            <button
              onClick={sendQueued}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Simulate Send
            </button>
          </div>

          {message && (
            <div className="rounded-lg border p-4 text-sm">
              {message}
            </div>
          )}
        </section>
      </main>
    </FeatureGate>
  )
}
