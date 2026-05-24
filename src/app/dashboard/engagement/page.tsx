"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { FeatureGate } from "../components/features/feature-gate"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const eventTypes = ["opened", "clicked", "replied", "bounced", "unsubscribed"]

export default function EngagementPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [queue, setQueue] = useState<any[]>([])
  const [message, setMessage] = useState("")

  const sentMessages = useMemo(
    () => queue.filter((item) => item.status === "sent"),
    [queue]
  )

  async function load() {
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
    setWorkspace(workspaceData.workspace)

    if (!workspaceData.workspace?.id) return

    const queueResponse = await fetch("/api/outbound/send-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspaceData.workspace.id }),
    })

    const queueData = await queueResponse.json()
    setQueue(queueData.queue || [])
  }

  async function recordEngagement(item: any, eventType: string) {
    if (!workspace?.id) return

    const response = await fetch("/api/outbound/engagement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: workspace.id,
        queueId: item.id,
        contactId: item.contact_id,
        eventType,
        metadata: {
          subject: item.subject,
          recipient: item.crm_contacts?.email,
          simulated: true,
        },
      }),
    })

    const data = await response.json()
    setMessage(response.ok ? `Recorded ${eventType}.` : data.error)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <FeatureGate
      feature="advanced_analytics"
      title="Engagement tracking requires Pro"
      description="Upgrade to Pro or Business to track opens, clicks, replies, bounces, and outbound intelligence."
    >
      <main className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Engagement Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Simulate and monitor outbound engagement events before connecting provider webhooks.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border p-4 text-sm">
            {message}
          </div>
        )}

        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Sent messages</h2>

          <div className="mt-4 space-y-3">
            {sentMessages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No sent messages yet. Use Send Queue to simulate delivery first.
              </p>
            )}

            {sentMessages.map((item) => (
              <div key={item.id} className="rounded-lg border p-4 space-y-3">
                <div>
                  <p className="font-medium">{item.subject || "Untitled message"}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.crm_contacts?.email || "No recipient"} · {item.outbound_sequences?.name || "No sequence"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => recordEngagement(item, type)}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      Mark {type}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </FeatureGate>
  )
}