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
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [message, setMessage] = useState("")

  async function loadQueue(workspaceId: string) {
    const [queueResponse, enrollmentResponse] = await Promise.all([
      fetch("/api/outbound/send-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      }),
      fetch("/api/outbound/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      }),
    ])

    const queueData = await queueResponse.json()
    const enrollmentData = await enrollmentResponse.json()

    setQueue(queueData.queue || [])
    setEnrollments(enrollmentData.enrollments || [])
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

    if (data.workspace?.id) await loadQueue(data.workspace.id)
  }

  async function buildQueue() {
    if (!workspace?.id) return

    const response = await fetch("/api/outbound/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id }),
    })

    const data = await response.json()

    setMessage(
      response.ok
        ? data.queued?.length
          ? `Queued ${data.queued.length} message(s).`
          : "No new messages queued. Existing steps may already be sent or not due yet."
        : data.error
    )

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

    setMessage(
      response.ok
        ? data.sent?.length
          ? `Sent ${data.sent.length} message(s).`
          : "No queued messages ready to send."
        : data.error
    )

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
            Monitor enrolled contacts, due sequence steps, queued messages, and delivery status.
          </p>
        </div>

        <section className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Sequence delivery controls</h2>

          <div className="flex flex-wrap gap-3">
            <button onClick={buildQueue} className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90">
              Build Send Queue
            </button>

            <button onClick={sendQueued} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
              Simulate Send
            </button>

            <button onClick={() => workspace?.id && loadQueue(workspace.id)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
              Refresh
            </button>
          </div>

          {message && <div className="rounded-lg border p-4 text-sm">{message}</div>}
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Active Enrollments</h2>

          <div className="mt-4 space-y-3">
            {enrollments.length === 0 && (
              <p className="text-sm text-muted-foreground">No enrolled contacts yet.</p>
            )}

            {enrollments.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {[item.crm_contacts?.first_name, item.crm_contacts?.last_name].filter(Boolean).join(" ") || "Unnamed contact"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.crm_contacts?.email || "No email"} · {item.outbound_sequences?.name || "No sequence"}
                    </p>
                  </div>

                  <span className="rounded-full border px-3 py-1 text-xs capitalize">
                    {item.status}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                  <p>Current step: {item.current_step}</p>
                  <p>Next send: {item.next_send_at ? new Date(item.next_send_at).toLocaleString() : "—"}</p>
                  <p>Enrollment ID: {item.id.slice(0, 8)}...</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Queue History</h2>

          <div className="mt-4 space-y-3">
            {queue.length === 0 && (
              <p className="text-sm text-muted-foreground">No queued or sent messages yet.</p>
            )}

            {queue.map((item) => (
              <div key={item.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.subject || "Untitled message"}</p>
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
                  <p>Scheduled: {item.scheduled_for ? new Date(item.scheduled_for).toLocaleString() : "—"}</p>
                </div>

                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">Preview message</summary>
                  <pre className="mt-3 whitespace-pre-wrap rounded bg-muted p-4 text-xs">{item.body}</pre>
                </details>
              </div>
            ))}
          </div>
        </section>
      </main>
    </FeatureGate>
  )
}
