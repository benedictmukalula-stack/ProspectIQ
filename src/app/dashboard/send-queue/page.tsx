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
  const [queue, setQueue] = useState<any[]>([])
  const [message, setMessage] = useState("")

  async function loadQueue(workspaceId: string) {
    const response = await fetch("/api/outbound/send-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    })

    const data = await response.json()
    setQueue(data.queue || [])
  }

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

    if (data.workspace?.id) {
      await loadQueue(data.workspace.id)
    }
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
    await loadQueue(workspace.id)
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
    await loadQueue(workspace.id)
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
            Queue due sequence messages, simulate delivery, and monitor outbound status.
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

            <button
              onClick={() => workspace?.id && loadQueue(workspace.id)}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Refresh Queue
            </button>
          </div>

          {message && (
            <div className="rounded-lg border p-4 text-sm">
              {message}
            </div>
          )}
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Queue History</h2>

          <div className="mt-4 space-y-3">
            {queue.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No queued or sent messages yet.
              </p>
            )}

            {queue.map((item) => (
              <div key={item.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {item.subject || "Untitled message"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.crm_contacts?.email || "No recipient"} · {item.outbound_sequences?.name || "No sequence"}
                    </p>
                  </div>

                  <span className="rounded-full border px-3 py-1 text-xs capitalize">
                    {item.status}
                  </span>
                </div>

                <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-4">
                  <p>Step: {item.outbound_sequence_steps?.step_order || "—"}</p>
                  <p>Channel: {item.channel}</p>
                  <p>Provider: {item.metadata?.provider || "mock/pending"}</p>
                  <p>
                    Scheduled:{" "}
                    {item.scheduled_for
                      ? new Date(item.scheduled_for).toLocaleString()
                      : "—"}
                  </p>
                </div>

                {item.error && (
                  <div className="rounded bg-red-50 p-3 text-xs text-red-700">
                    {item.error}
                  </div>
                )}

                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">
                    Preview message
                  </summary>
                  <pre className="mt-3 whitespace-pre-wrap rounded bg-muted p-4 text-xs">
                    {item.body}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </section>
      </main>
    </FeatureGate>
  )
}
