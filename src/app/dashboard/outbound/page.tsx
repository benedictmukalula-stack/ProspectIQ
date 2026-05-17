"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { FeatureGate } from "@/components/features/feature-gate"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OutboundPage() {
  const [drafts, setDrafts] = useState<any[]>([])
  const [workspaceName, setWorkspaceName] = useState("")

  useEffect(() => {
    async function loadDrafts() {
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

      if (!workspaceData.workspace?.id) return

      setWorkspaceName(workspaceData.workspace.name)

      const response = await fetch("/api/outbound/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspaceData.workspace.id }),
      })

      const data = await response.json()
      setDrafts(data.drafts || [])
    }

    loadDrafts()
  }, [])

  return (
    <FeatureGate
      feature="campaigns"
      title="Outbound drafts require campaign access"
      description="Upgrade to create and manage AI-generated outbound drafts and campaign assets."
    >
      <main className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Outbound Drafts</h1>
          <p className="text-sm text-muted-foreground">
            Review AI-generated emails and campaign assets before sending.
          </p>
          {workspaceName && (
            <p className="mt-1 text-xs text-muted-foreground">
              Workspace: {workspaceName}
            </p>
          )}
        </div>

        <section className="space-y-4">
          {drafts.length === 0 && (
            <div className="rounded-xl border p-6">
              <p className="text-sm text-muted-foreground">
                No outbound drafts yet. Run the Outbound Email Drafting workflow to generate one.
              </p>
            </div>
          )}

          {drafts.map((draft) => (
            <div key={draft.id} className="rounded-xl border p-6 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {draft.subject || "Untitled draft"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {draft.crm_contacts?.email || "No email"} · {draft.crm_companies?.name || "No company"}
                  </p>
                </div>

                <span className="rounded-full border px-3 py-1 text-xs capitalize">
                  {draft.status}
                </span>
              </div>

              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                {draft.body}
              </pre>
            </div>
          ))}
        </section>
      </main>
    </FeatureGate>
  )
}
